import { Box, Card, Flex, Grid, Heading, Text, Avatar, Button, Badge } from "@radix-ui/themes";
import { 
  ClockIcon, 
  GlobeIcon,
  RocketIcon
} from "@radix-ui/react-icons";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSuiClient } from "@mysten/dapp-kit";

// --- CATEGORIES ---
const CATEGORIES = [
  "All",
  "Engineering",
  "Design",
  "Security",
  "Business Development",
  "Accounting",
  "Infrastructure",
  "Marketing",
  "Product Management"
];

interface Job {
  id: string;
  name: string;
  company: string;
  location: string;
  employer: string;
  category: string;
  description: string;
  salary: number | null;
  deadline: number;
  hired_applicant: string | null;
  applicants_count: number;
}

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const suiClient = useSuiClient();

  // Fetch jobs from blockchain
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        
        // Get JobBoard object to retrieve all job IDs
        const jobBoard = await suiClient.getObject({
          id: import.meta.env.VITE_JOB_BOARD_ID,
          options: {
            showContent: true,
          },
        });

        if (jobBoard.data?.content?.dataType === "moveObject") {
          const fields = jobBoard.data.content.fields as any;
          const jobIds = fields.jobs || [];

          // Fetch all job details
          const jobPromises = jobIds.map(async (jobId: string) => {
            const jobObject = await suiClient.getObject({
              id: jobId,
              options: {
                showContent: true,
              },
            });

            if (jobObject.data?.content?.dataType === "moveObject") {
              const jobFields = jobObject.data.content.fields as any;
              return {
                id: jobId,
                name: jobFields.name || "",
                company: jobFields.company || "",
                location: jobFields.location || "",
                employer: jobFields.employer || "",
                category: jobFields.category || "",
                description: jobFields.description || "",
                salary: jobFields.salary ? parseInt(jobFields.salary) : null,
                deadline: parseInt(jobFields.deadline),
                hired_applicant: jobFields.hired_applicant || null,
                applicants_count: parseInt(jobFields.applicants_count || "0"),
              } as Job;
            }
            return null;
          });

          const fetchedJobs = (await Promise.all(jobPromises)).filter(
            (job): job is Job => job !== null
          );
          
          setJobs(fetchedJobs);
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [suiClient]);

  // Filter jobs by category
  const filteredJobs = selectedCategory === "All" 
    ? jobs 
    : jobs.filter(job => job.category === selectedCategory);

  const handleJobClick = (jobId: string) => {
    navigate(`/job/${jobId}`);
  };

  return (
    <Flex direction="column" gap="6">
      
      {/* --- HEADER --- */}
      <Box>
        <Heading size="8" mb="2">All Job Listings</Heading>
        <Text color="gray" size="4">
          {isLoading ? "Loading jobs..." : `${jobs.length} opportunities in Blockchain and Web3`}
        </Text>
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
      {isLoading ? (
        <Text size="4" color="gray" align="center">Loading jobs from blockchain...</Text>
      ) : filteredJobs.length === 0 ? (
        <Text size="4" color="gray" align="center">No jobs found in this category</Text>
      ) : (
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
                      fallback={job.company.charAt(0).toUpperCase()} 
                      color="iris" 
                      variant="soft" 
                      radius="medium"
                    />
                    <Box style={{ flex: 1 }}>
                      <Heading size="4" mb="1">{job.name}</Heading>
                      <Text size="2" weight="medium" color="gray">{job.company}</Text>
                    </Box>
                  </Flex>

                  {/* Details */}
                  <Flex direction="column" gap="2">
                    <Flex gap="2" align="center">
                      <GlobeIcon width="14" height="14" color="gray" />
                      <Text size="2" color="gray">{job.location} • {job.category}</Text>
                    </Flex>
                    <Text size="2" color="gray" style={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>{job.description}</Text>
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
      )}
    </Flex>
  );
}