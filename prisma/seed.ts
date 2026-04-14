import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Create Admin
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@talentlens.com" },
    update: {},
    create: {
      email: "admin@talentlens.com",
      name: "Admin User",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  console.log(`Admin user created: ${admin.email}`);

  // Create Candidate
  const candidatePassword = await bcrypt.hash("candidate123", 10);
  const candidate = await prisma.user.upsert({
    where: { email: "candidate@example.com" },
    update: {},
    create: {
      email: "candidate@example.com",
      name: "Jane Doe",
      passwordHash: candidatePassword,
      role: "CANDIDATE",
      candidateProfile: {
        create: {
          phone: "555-0100",
          location: "San Francisco, CA",
          yearsOfExperience: 5,
          skills: ["React", "TypeScript", "Node.js", "Next.js"],
          education: "BS Computer Science",
        },
      },
    },
  });

  console.log(`Candidate user created: ${candidate.email}`);

  // Create Demo Job
  const job = await prisma.job.create({
    data: {
      title: "Senior Full-Stack Developer",
      department: "Engineering",
      location: "San Francisco / Remote",
      employmentType: "FULL_TIME",
      experienceLevel: "SENIOR",
      salaryMin: 130000,
      salaryMax: 180000,
      status: "PUBLISHED",
      description: "We are looking for a Senior Full-Stack Developer to join our core product team. You will be responsible for building new features from end-to-end using Next.js and PostgreSQL.",
      requiredSkills: ["React", "TypeScript", "Node.js", "SQL"],
      preferredSkills: ["Next.js", "Prisma", "AWS"],
      createdById: admin.id,
      screeningQuestions: {
        create: [
          {
            question: "Describe a complex technical challenge you solved recently.",
            orderNum: 0,
            required: true,
          },
          {
            question: "Why are you interested in this position?",
            orderNum: 1,
            required: true,
          },
        ],
      },
    },
  });

  console.log(`Demo job created: ${job.title}`);
  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
