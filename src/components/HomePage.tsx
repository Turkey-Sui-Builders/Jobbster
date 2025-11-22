import { Box, Card, Flex, Grid, Heading, Text, Avatar, Button, Badge } from "@radix-ui/themes";
import { 
  ClockIcon, 
  LaptopIcon,
  GlobeIcon,
  RocketIcon
} from "@radix-ui/react-icons";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// --- CATEGORIES ---
const CATEGORIES = [
  "All",
  "Engineering",
  "Design",
  "Security",
  "Business Development",
  "Accounting",
  "Infrastructure"
];

// --- MOCK JOB DATA (Based on Smart Contract Structure) ---
const ALL_JOBS = [
  {
    id: "1",
    name: "Senior Move Developer",
    employer: "0x1234...5678", // employer address
    category: "Engineering",
    description: "We are looking for an experienced Move developer to build secure smart contracts on Sui blockchain.",
    salary: 150000, // in USD (optional field)
    deadline: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
    hired_applicant: null,
    logo: "M"
  },
  {
    id: "2",
    name: "Frontend Developer (React)",
    employer: "0x8765...4321",
    category: "Engineering",
    description: "Join our team to build modern Web3 applications with React and TypeScript.",
    salary: 100000,
    deadline: Date.now() + 25 * 24 * 60 * 60 * 1000,
    hired_applicant: null,
    logo: "S"
  },
  {
    id: "3",
    name: "Smart Contract Auditor",
    employer: "0xabcd...ef01",
    category: "Security",
    description: "Audit smart contracts for security vulnerabilities and provide comprehensive reports.",
    salary: 125000,
    deadline: Date.now() + 20 * 24 * 60 * 60 * 1000,
    hired_applicant: null,
    logo: "O"
  },
  {
    id: "4",
    name: "Product Designer",
    employer: "0x2345...6789",
    category: "Design",
    description: "Design intuitive user experiences for our blockchain-based products.",
    salary: 115000,
    deadline: Date.now() + 15 * 24 * 60 * 60 * 1000,
    hired_applicant: null,
    logo: "T"
  },
  {
    id: "5",
    name: "Rust Backend Engineer",
    employer: "0x3456...789a",
    category: "Engineering",
    description: "Build high-performance backend systems using Rust for our NFT marketplace.",
    salary: 135000,
    deadline: Date.now() + 28 * 24 * 60 * 60 * 1000,
    hired_applicant: null,
    logo: "B"
  },
  {
    id: "6",
    name: "DevOps Engineer",
    employer: "0x4567...89ab",
    category: "Infrastructure",
    description: "Manage and scale our blockchain infrastructure and deployment pipelines.",
    salary: 120000,
    deadline: Date.now() + 27 * 24 * 60 * 60 * 1000,
    hired_applicant: null,
    logo: "S"
  }
];

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const navigate = useNavigate();

  // Filter jobs by category
  const filteredJobs = selectedCategory === "All" 
    ? ALL_JOBS 
    : ALL_JOBS.filter(job => job.category === selectedCategory);

  const handleJobClick = (jobId: string) => {
    navigate(`/job/${jobId}`);
  };

  return (
    <Flex direction="column" gap="6">
      
      {/* --- HEADER --- */}
      <Box>
        <Heading size="8" mb="2">All Job Listings</Heading>
        <Text color="gray" size="4">Latest opportunities in Blockchain and Web3</Text>
      </Box>

      {/* --- CATEGORY FILTER --- */}
      <Box>
        <Text size="2" weight="medium" mb="5" color="gray">Categories</Text>
        <Flex gap="2" wrap="wrap">
          {CATEGORIES.map((category) => (
            <Badge
              key={category}
              size="2"
              variant={selectedCategory === category ? "solid" : "soft"}
              color={selectedCategory === category ? "iris" : "gray"}
              style={{ cursor: "pointer", padding: "8px 16px" }}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </Flex>
      </Box>

      {/* --- JOB CARDS (GRID) --- */}
      <Grid columns={{ initial: "1", sm: "2", lg: "3" }} gap="4">
        {filteredJobs.map((job) => (
          <Card 
            key={job.id} 
            size="3" 
            style={{ 
              transition: "all 0.2s", 
              cursor: "pointer",
              aspectRatio: "1",
              display: "flex",
              flexDirection: "column"
            }}
            onClick={() => handleJobClick(job.id)}
          >
            <Flex direction="column" justify="between" height="100%">
              
              {/* Üst Kısım */}
              <Box>
                <Flex gap="3" mb="3">
                  <Avatar 
                    size="4" 
                    fallback={job.logo} 
                    color="iris" 
                    variant="soft" 
                    radius="medium"
                  />
                  <Box style={{ flex: 1 }}>
                    <Heading size="4" mb="1">{job.name}</Heading>
                    <Text size="2" weight="medium" color="gray">{job.employer.substring(0, 6)}...{job.employer.slice(-4)}</Text>
                  </Box>
                </Flex>

                {/* Details */}
                <Flex direction="column" gap="2">
                  <Flex gap="2" align="center">
                    <GlobeIcon width="14" height="14" color="gray" />
                    <Text size="2" color="gray">{job.category}</Text>
                  </Flex>
                  <Flex gap="2" align="center">
                    <LaptopIcon width="14" height="14" color="gray" />
                    <Text size="2" color="gray" style={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>{job.description}</Text>
                  </Flex>
                  <Flex gap="2" align="center">
                    <ClockIcon width="14" height="14" color="gray" />
                    <Text size="2" color="gray">
                      Deadline: {new Date(job.deadline).toLocaleDateString()}
                    </Text>
                  </Flex>
                </Flex>
              </Box>

              {/* Bottom Section */}
              <Box mt="4">
                <Flex justify="between" align="center">
                  <Text size="3" weight="bold" color="iris">
                    {job.salary ? `$${(job.salary / 1000).toFixed(0)}k` : 'Not specified'}
                  </Text>
                  <Button size="2" variant="soft">
                    <RocketIcon />
                    Apply
                  </Button>
                </Flex>
              </Box>
            </Flex>
          </Card>
        ))}
      </Grid>
    </Flex>
  );
}