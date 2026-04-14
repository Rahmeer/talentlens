import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pg", "@prisma/adapter-pg", "pdf-parse", "mammoth", "bcryptjs"],
};

export default nextConfig;
