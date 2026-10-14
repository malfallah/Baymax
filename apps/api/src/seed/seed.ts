import { DEMO_DOCTOR_EMAIL, DEMO_PASSWORD, DEMO_PATIENT_EMAIL } from '@baymax/shared';
import { env } from '../config/env';
import { connectDatabase, disconnectDatabase } from '../db';
import { logger } from '../lib/logger';
import { seedDatabase } from './seedData';

await connectDatabase(env.MONGODB_URI);
const summary = await seedDatabase();
logger.info(summary, 'Database seeded');
logger.info(`Demo patient: ${DEMO_PATIENT_EMAIL} / ${DEMO_PASSWORD}`);
logger.info(`Demo doctor:  ${DEMO_DOCTOR_EMAIL} / ${DEMO_PASSWORD}`);
await disconnectDatabase();
