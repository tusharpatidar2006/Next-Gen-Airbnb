import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import fastifyJwt from '@fastify/jwt';
import fastifyCors from '@fastify/cors';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

if (process.env.DATABASE_URL?.startsWith('file:./')) {
  const sqliteFile = process.env.DATABASE_URL.slice('file:'.length);
  process.env.DATABASE_URL = `file:${path.resolve(process.cwd(), sqliteFile).replace(/\\/g, '/')}`;
}

const PORT = Number(process.env.PORT ?? 4001);
const JWT_SECRET = process.env.JWT_SECRET ?? 'nwxt-gen-default-secret';

const prisma = new PrismaClient();
const app = Fastify({ logger: true });

// Setup hooks
app.register(fastifyJwt, { secret: JWT_SECRET });
app.register(fastifyCors, { origin: true });

app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

app.get('/health', async () => ({ status: 'ok' }));

app.post('/register', async (request, reply) => {
  const { name, email, password } = request.body as Record<string, string>;

  if (!name || !email || !password) {
    return reply.status(400).send({ message: 'Name, email, and password are required' });
  }

  const normalizedEmail = email.toLowerCase();
  
  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existingUser) {
    return reply.status(409).send({ message: 'Email already registered' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email: normalizedEmail, passwordHash }
  });

  return reply.status(201).send({ message: 'User registered successfully', user: { id: user.id, name: user.name, email: user.email } });
});

app.post('/login', async (request, reply) => {
  const { email, password } = request.body as Record<string, string>;

  if (!email || !password) {
    return reply.status(400).send({ message: 'Email and password are required' });
  }

  const normalizedEmail = email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (!user) {
    return reply.status(404).send({ message: 'No user exists, please register first' });
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    return reply.status(401).send({ message: 'Incorrect password' });
  }

  const token = app.jwt.sign({ userId: user.id, email: user.email, name: user.name });
  return reply.send({ message: 'Login successful', token, user: { id: user.id, name: user.name, email: user.email } });
});

app.get('/profile', { preValidation: [(app as any).authenticate] }, async (request, reply) => {
  const userPayload = request.user as { userId: string; email: string; name: string };
  return reply.send({
    id: userPayload.userId,
    email: userPayload.email,
    name: userPayload.name,
  });
});

app.get('/wishlist', { preValidation: [(app as any).authenticate] }, async (request, reply) => {
  const userPayload = request.user as { userId: string };
  const wishlist = await prisma.wishlist.findMany({
    where: { userId: userPayload.userId }
  });
  return reply.send({ wishlist: wishlist.map((w: { listingId: string }) => w.listingId) });
});

app.post('/wishlist/toggle', { preValidation: [(app as any).authenticate] }, async (request, reply) => {
  const userPayload = request.user as { userId: string };
  const { listingId } = request.body as { listingId: string };

  if (!listingId) {
    return reply.status(400).send({ message: 'listingId is required' });
  }

  const existing = await prisma.wishlist.findUnique({
    where: {
      userId_listingId: {
        userId: userPayload.userId,
        listingId
      }
    }
  });

  if (existing) {
    await prisma.wishlist.delete({ where: { id: existing.id } });
    return reply.send({ status: 'removed', listingId });
  } else {
    await prisma.wishlist.create({
      data: {
        userId: userPayload.userId,
        listingId
      }
    });
    return reply.send({ status: 'added', listingId });
  }
});

app.get('/agent-memory/:agentId', { preValidation: [(app as any).authenticate] }, async (request, reply) => {
  const userPayload = request.user as { userId: string };
  const { agentId } = request.params as { agentId: string };

  const session = await prisma.chatSession.findUnique({
    where: {
      userId_agentId: {
        userId: userPayload.userId,
        agentId,
      }
    },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  return reply.send({
    sessionId: session?.id ?? null,
    messages: (session?.messages ?? []).map(message => ({
      id: message.id,
      role: message.role,
      text: message.text,
      createdAt: message.createdAt,
    }))
  });
});

app.put('/agent-memory/:agentId', { preValidation: [(app as any).authenticate] }, async (request, reply) => {
  const userPayload = request.user as { userId: string };
  const { agentId } = request.params as { agentId: string };
  const { messages } = request.body as {
    messages?: Array<{ role?: string; text?: string }>;
  };

  const validMessages = (messages ?? []).filter(
    (message): message is { role: string; text: string } =>
      typeof message?.role === 'string' &&
      typeof message?.text === 'string' &&
      message.text.trim().length > 0
  );

  const session = await prisma.chatSession.upsert({
    where: {
      userId_agentId: {
        userId: userPayload.userId,
        agentId,
      }
    },
    update: {},
    create: {
      userId: userPayload.userId,
      agentId,
    }
  });

  await prisma.chatMessage.deleteMany({
    where: { sessionId: session.id }
  });

  if (validMessages.length > 0) {
    await prisma.chatMessage.createMany({
      data: validMessages.map(message => ({
        sessionId: session.id,
        role: message.role,
        text: message.text.trim(),
      }))
    });
  }

  const updatedSession = await prisma.chatSession.findUnique({
    where: { id: session.id },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  return reply.send({
    sessionId: session.id,
    messages: (updatedSession?.messages ?? []).map(message => ({
      id: message.id,
      role: message.role,
      text: message.text,
      createdAt: message.createdAt,
    }))
  });
});

app.post('/agent-memory/:agentId', { preValidation: [(app as any).authenticate] }, async (request, reply) => {
  const userPayload = request.user as { userId: string };
  const { agentId } = request.params as { agentId: string };
  const { messages } = request.body as {
    messages?: Array<{ role?: string; text?: string }>;
  };

  const validMessages = (messages ?? []).filter(
    (message): message is { role: string; text: string } =>
      typeof message?.role === 'string' &&
      typeof message?.text === 'string' &&
      message.text.trim().length > 0
  );

  if (validMessages.length === 0) {
    return reply.status(400).send({ message: 'At least one message is required.' });
  }

  const session = await prisma.chatSession.upsert({
    where: {
      userId_agentId: {
        userId: userPayload.userId,
        agentId,
      }
    },
    update: {},
    create: {
      userId: userPayload.userId,
      agentId,
    }
  });

  await prisma.chatMessage.createMany({
    data: validMessages.map(message => ({
      sessionId: session.id,
      role: message.role,
      text: message.text.trim(),
    }))
  });

  const updatedSession = await prisma.chatSession.findUnique({
    where: { id: session.id },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  return reply.send({
    sessionId: session.id,
    messages: (updatedSession?.messages ?? []).map(message => ({
      id: message.id,
      role: message.role,
      text: message.text,
      createdAt: message.createdAt,
    }))
  });
});

// ─── PUBLIC LISTINGS ─────────────────────────────────────────────────────────

// Get all properties (public, no auth) with optional filters
app.get('/listings', async (request, reply) => {
  const { location, features, minPrice, maxPrice, search } = request.query as {
    location?: string;
    features?: string;   // comma-separated: "Pool,WiFi"
    minPrice?: string;
    maxPrice?: string;
    search?: string;
  };

  const allProperties = await prisma.property.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      host: {
        include: {
          user: { select: { id: true, name: true } }
        }
      }
    }
  });

  // Apply filters in-memory (SQLite doesn't support JSON queries)
  let filtered = allProperties.filter(p => {
    // Location filter
    if (location && !p.location.toLowerCase().includes(location.toLowerCase())) return false;

    // Search filter (title / description / location)
    if (search) {
      const q = search.toLowerCase();
      const matchesTitle = p.title.toLowerCase().includes(q);
      const matchesDesc = p.description?.toLowerCase().includes(q) ?? false;
      const matchesLoc = p.location.toLowerCase().includes(q);
      if (!matchesTitle && !matchesDesc && !matchesLoc) return false;
    }

    // Price range filter
    if (minPrice && p.price < Number(minPrice)) return false;
    if (maxPrice && p.price > Number(maxPrice)) return false;

    // Features filter (comma-separated: must have ALL requested features)
    if (features) {
      const requested = features.split(',').map(f => f.trim().toLowerCase());
      let propertyFeatures: string[] = [];
      try {
        if (p.features) {
          const parsed = JSON.parse(p.features);
          if (Array.isArray(parsed)) {
            propertyFeatures = parsed.map((f: any) => String(f).toLowerCase());
          }
        }
      } catch (e) {
        console.error('Error parsing features for property', p.id, e);
      }
      
      const hasAll = requested.every(rf => propertyFeatures.includes(rf));
      if (!hasAll) return false;
    }

    return true;
  });

  // Parse JSON fields before responding
  const result = filtered.map(p => {
    let photos = [];
    let features = [];
    let services = [];
    
    try { if (p.photos) photos = JSON.parse(p.photos); } catch(e) {}
    try { if (p.features) features = JSON.parse(p.features); } catch(e) {}
    try { if (p.services) services = JSON.parse(p.services); } catch(e) {}

    return {
      id: p.id,
      title: p.title,
      description: p.description,
      photos: Array.isArray(photos) ? photos : [],
      price: p.price,
      location: p.location,
      size: p.size,
      features: Array.isArray(features) ? features : [],
      services: Array.isArray(services) ? services : [],
      createdAt: p.createdAt,
      host: {
        id: p.host.id,
        hostName: p.host.user.name,
      }
    };
  });

  return reply.send({ total: result.length, listings: result });
});

// Get distinct locations (for filter dropdowns)
app.get('/listings/locations', async (_request, reply) => {
  const properties = await prisma.property.findMany({ select: { location: true } });
  const unique = [...new Set(properties.map(p => p.location))].sort();
  return reply.send({ locations: unique });
});

// ─── HOST PROFILE ───────────────────────────────────────────────────────────


// Create or update host profile
app.post('/host/profile', { preValidation: [(app as any).authenticate] }, async (request, reply) => {
  const userPayload = request.user as { userId: string };
  const { bio } = request.body as { bio?: string };

  const profile = await prisma.hostProfile.upsert({
    where: { userId: userPayload.userId },
    update: { bio },
    create: { userId: userPayload.userId, bio }
  });

  return reply.send({ profile });
});

// Get host profile (with properties)
app.get('/host/profile', { preValidation: [(app as any).authenticate] }, async (request, reply) => {
  const userPayload = request.user as { userId: string };

  const profile = await prisma.hostProfile.findUnique({
    where: { userId: userPayload.userId },
    include: { properties: { orderBy: { createdAt: 'desc' } } }
  });

  return reply.send({ profile });
});

// ─── PROPERTIES ─────────────────────────────────────────────────────────────

// Create a new property
app.post('/host/properties', { preValidation: [(app as any).authenticate] }, async (request, reply) => {
  const userPayload = request.user as { userId: string };
  const { title, description, photos, price, location, size, features, services } = request.body as {
    title: string; description?: string; photos: string[];
    price: number; location: string; size?: string;
    features?: string[]; services?: string[];
  };

  if (!title || !price || !location) {
    return reply.status(400).send({ message: 'title, price, and location are required' });
  }

  // Get or create host profile
  let profile = await prisma.hostProfile.findUnique({ where: { userId: userPayload.userId } });
  if (!profile) {
    profile = await prisma.hostProfile.create({ data: { userId: userPayload.userId } });
  }

  const property = await prisma.property.create({
    data: {
      hostId: profile.id,
      title,
      description,
      photos: JSON.stringify(photos || []),
      price,
      location,
      size,
      features: features ? JSON.stringify(features) : null,
      services: services ? JSON.stringify(services) : null,
    }
  });

  return reply.status(201).send({ property });
});

// Get all properties for current host
app.get('/host/properties', { preValidation: [(app as any).authenticate] }, async (request, reply) => {
  const userPayload = request.user as { userId: string };

  const profile = await prisma.hostProfile.findUnique({
    where: { userId: userPayload.userId },
    include: { properties: { orderBy: { createdAt: 'desc' } } }
  });

  if (!profile) return reply.send({ properties: [] });
  return reply.send({ properties: profile.properties });
});

// Delete a property
app.delete('/host/properties/:id', { preValidation: [(app as any).authenticate] }, async (request, reply) => {
  const userPayload = request.user as { userId: string };
  const { id } = request.params as { id: string };

  const profile = await prisma.hostProfile.findUnique({ where: { userId: userPayload.userId } });
  if (!profile) return reply.status(404).send({ message: 'Host profile not found' });

  const property = await prisma.property.findFirst({ where: { id, hostId: profile.id } });
  if (!property) return reply.status(404).send({ message: 'Property not found' });

  await prisma.property.delete({ where: { id } });
  return reply.send({ message: 'Property deleted' });
});

// ─── BOOKINGS ─────────────────────────────────────────────────────────────────

// Create a booking
app.post('/bookings', { preValidation: [(app as any).authenticate] }, async (request, reply) => {
  const userPayload = request.user as { userId: string };
  const { propertyId, startDate, endDate, amount, paymentMethod } = request.body as {
    propertyId: string;
    startDate: string;
    endDate: string;
    amount: number;
    paymentMethod?: string;
  };

  if (!propertyId || !startDate || !amount) {
    return reply.status(400).send({ message: 'propertyId, startDate, and amount are required' });
  }

  // Verify property
  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) return reply.status(404).send({ message: 'Property not found' });

  // Create booking & payment
  const booking = await prisma.booking.create({
    data: {
      userId: userPayload.userId,
      propertyId,
      startDate: new Date(startDate),
      endDate: new Date(endDate || startDate),
      totalPrice: amount,
      payment: {
        create: {
          amount,
          method: paymentMethod || 'CREDIT_CARD',
          status: 'COMPLETED'
        }
      }
    },
    include: { payment: true }
  });

  return reply.status(201).send({ message: 'Booking confirmed', booking });
});

// ─── HOST ANALYTICS ─────────────────────────────────────────────────────────

// Get host analytics overview
app.get('/host/analytics', { preValidation: [(app as any).authenticate] }, async (request, reply) => {
  const userPayload = request.user as { userId: string };

  const profile = await prisma.hostProfile.findUnique({
    where: { userId: userPayload.userId },
    include: { properties: true }
  });

  if (!profile) return reply.send({ revenue: 0, totalBookings: 0, growth: 0 });

  const propertyIds = profile.properties.map(p => p.id);
  
  if (propertyIds.length === 0) {
    return reply.send({ revenue: 0, totalBookings: 0, growth: 0 });
  }

  // Get all bookings for these properties
  const bookings = await prisma.booking.findMany({
    where: { propertyId: { in: propertyIds }, status: 'CONFIRMED' }
  });

  let revenue = 0;
  bookings.forEach(b => revenue += b.totalPrice);

  // Mock growth calculation
  const growth = bookings.length > 0 ? 15 : 0; // Fixed mockup for demo

  return reply.send({
    revenue,
    totalBookings: bookings.length,
    growth
  });
});

const start = async () => {
  try {
    await app.listen({ port: PORT, host: '0.0.0.0' });
    app.log.info(`Auth service listening on http://0.0.0.0:${PORT}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();
