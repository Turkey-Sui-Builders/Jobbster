import { Box, Card, Flex, Grid, Heading, Text, TextField, TextArea, Button, Badge, Avatar } from "@radix-ui/themes";
import { MagicWandIcon, RocketIcon, CheckCircledIcon, LightningBoltIcon } from "@radix-ui/react-icons";
import { useState } from "react";

interface JobRecommendation {
  id: string;
  name: string;
  company: string;
  category: string;
  location: string;
  salary: number;
  matchScore: number;
  matchReasons: string[];
  logo: string;
}

export default function FindBestJobPage() {
  const [formData, setFormData] = useState({
    skills: "",
    experience: "",
    preferredCategory: "",
    location: "",
    salaryExpectation: "",
    additionalInfo: ""
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setHasSearched(true);

    try {
      // TODO: Integrate with AI backend
      // Send formData to AI API and get job recommendations
      console.log("Analyzing profile:", formData);

      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Mock recommendations (Replace with actual AI response)
      const mockRecommendations: JobRecommendation[] = [
        {
          id: "1",
          name: "Senior Move Developer",
          company: "Mysten Labs",
          category: "Engineering",
          location: "Remote",
          salary: 150000,
          matchScore: 95,
          matchReasons: [
            "Strong match with your blockchain experience",
            "Skills align with Move development requirements",
            "Remote work preference matches"
          ],
          logo: "M"
        },
        {
          id: "2",
          name: "Smart Contract Auditor",
          company: "OtterSec",
          category: "Security",
          location: "Remote",
          salary: 125000,
          matchScore: 88,
          matchReasons: [
            "Your security background is highly relevant",
            "Experience level matches job requirements",
            "Salary range aligns with expectations"
          ],
          logo: "O"
        },
        {
          id: "3",
          name: "Rust Backend Engineer",
          company: "BlueMove NFT",
          category: "Engineering",
          location: "Remote",
          salary: 135000,
          matchScore: 82,
          matchReasons: [
            "Your Rust expertise is a strong fit",
            "Backend experience matches requirements",
            "Company culture aligns with your preferences"
          ],
          logo: "B"
        }
      ];

      setRecommendations(mockRecommendations);
    } catch (error) {
      console.error("Error getting recommendations:", error);
      alert("Failed to get recommendations. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const isFormValid = formData.skills && formData.experience;

  return (
    <Flex direction="column" gap="6">
      
      {/* Header */}
      <Box>
        <Flex align="center" gap="3" mb="2">
          <MagicWandIcon width="32" height="32" color="var(--accent-9)" />
          <Heading size="8">AI Job Matcher</Heading>
        </Flex>
        <Text color="gray" size="4">
          Tell us about yourself and our AI will find the perfect jobs for you
        </Text>
      </Box>

      <Grid columns={{ initial: "1", md: "3" }} gap="6">
        
        {/* Form Section - Left (2 columns) */}
        <Box style={{ gridColumn: "span 2" }}>
          <Card size="3">
            <form onSubmit={handleSubmit}>
              <Flex direction="column" gap="5">
                
                <Heading size="5" mb="2">Your Profile</Heading>

                {/* Skills */}
                <Box>
                  <Text size="2" weight="medium" mb="2">Skills & Technologies *</Text>
                  <TextArea
                    placeholder="e.g., Move, Rust, React, TypeScript, Smart Contracts, Web3..."
                    rows={3}
                    value={formData.skills}
                    onChange={(e) => handleChange("skills", e.target.value)}
                    required
                  />
                  <Text size="1" color="gray" mt="1">
                    List your technical skills and areas of expertise
                  </Text>
                </Box>

                {/* Experience */}
                <Box>
                  <Text size="2" weight="medium" mb="2">Experience & Background *</Text>
                  <TextArea
                    placeholder="e.g., 5 years in blockchain development, worked on DeFi protocols..."
                    rows={4}
                    value={formData.experience}
                    onChange={(e) => handleChange("experience", e.target.value)}
                    required
                  />
                  <Text size="1" color="gray" mt="1">
                    Describe your work experience and background
                  </Text>
                </Box>

                {/* Preferred Category */}
                <Box>
                  <Text size="2" weight="medium" mb="2">Preferred Job Category</Text>
                  <TextField.Root
                    placeholder="e.g., Engineering, Design, Security..."
                    value={formData.preferredCategory}
                    onChange={(e) => handleChange("preferredCategory", e.target.value)}
                  />
                  <Text size="1" color="gray" mt="1">
                    Optional: Specify your preferred job category
                  </Text>
                </Box>

                {/* Location Preference */}
                <Box>
                  <Text size="2" weight="medium" mb="2">Location Preference</Text>
                  <TextField.Root
                    placeholder="e.g., Remote, San Francisco, Flexible..."
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                  />
                  <Text size="1" color="gray" mt="1">
                    Optional: Your preferred work location
                  </Text>
                </Box>

                {/* Salary Expectation */}
                <Box>
                  <Text size="2" weight="medium" mb="2">Salary Expectation (USD/year)</Text>
                  <TextField.Root
                    type="number"
                    placeholder="e.g., 120000"
                    value={formData.salaryExpectation}
                    onChange={(e) => handleChange("salaryExpectation", e.target.value)}
                    min="0"
                    step="5000"
                  />
                  <Text size="1" color="gray" mt="1">
                    Optional: Your expected annual salary
                  </Text>
                </Box>

                {/* Additional Info */}
                <Box>
                  <Text size="2" weight="medium" mb="2">Additional Information</Text>
                  <TextArea
                    placeholder="Any other preferences or information that might help us find the perfect job for you..."
                    rows={3}
                    value={formData.additionalInfo}
                    onChange={(e) => handleChange("additionalInfo", e.target.value)}
                  />
                  <Text size="1" color="gray" mt="1">
                    Optional: Career goals, work culture preferences, etc.
                  </Text>
                </Box>

                {/* Submit Button */}
                <Button
                  type="submit"
                  size="3"
                  disabled={!isFormValid || isAnalyzing}
                  style={{ cursor: "pointer" }}
                >
                  {isAnalyzing ? (
                    <>
                      <LightningBoltIcon />
                      Analyzing Your Profile...
                    </>
                  ) : (
                    <>
                      <MagicWandIcon />
                      Find My Perfect Jobs
                    </>
                  )}
                </Button>
              </Flex>
            </form>
          </Card>
        </Box>

        {/* Info Sidebar - Right (1 column) */}
        <Box>
          <Card size="3" mb="4">
            <Flex direction="column" gap="3">
              <Flex align="center" gap="2">
                <LightningBoltIcon width="20" height="20" color="var(--amber-9)" />
                <Heading size="4">How It Works</Heading>
              </Flex>
              <Text size="2" color="gray">
                Our AI analyzes your skills, experience, and preferences to match you with the most suitable job opportunities.
              </Text>
              <Box>
                <Text size="2" weight="medium" mb="2">The AI considers:</Text>
                <Flex direction="column" gap="2">
                  <Flex gap="2" align="start">
                    <Text color="iris">•</Text>
                    <Text size="2" color="gray">Skill compatibility</Text>
                  </Flex>
                  <Flex gap="2" align="start">
                    <Text color="iris">•</Text>
                    <Text size="2" color="gray">Experience level match</Text>
                  </Flex>
                  <Flex gap="2" align="start">
                    <Text color="iris">•</Text>
                    <Text size="2" color="gray">Location preferences</Text>
                  </Flex>
                  <Flex gap="2" align="start">
                    <Text color="iris">•</Text>
                    <Text size="2" color="gray">Salary expectations</Text>
                  </Flex>
                  <Flex gap="2" align="start">
                    <Text color="iris">•</Text>
                    <Text size="2" color="gray">Career goals alignment</Text>
                  </Flex>
                </Flex>
              </Box>
            </Flex>
          </Card>

          <Card size="3" variant="surface" style={{ backgroundColor: "var(--green-2)" }}>
            <Flex direction="column" gap="2">
              <Flex align="center" gap="2">
                <CheckCircledIcon color="var(--green-9)" />
                <Text size="2" weight="bold" color="green">AI-Powered Matching</Text>
              </Flex>
              <Text size="1" color="gray">
                Get personalized job recommendations based on advanced machine learning algorithms trained on thousands of successful placements.
              </Text>
            </Flex>
          </Card>
        </Box>
      </Grid>

      {/* Recommendations Section */}
      {hasSearched && (
        <Box mt="4">
          <Heading size="6" mb="4">
            {isAnalyzing ? "Finding Your Perfect Matches..." : `Top ${recommendations.length} Job Matches`}
          </Heading>

          {!isAnalyzing && recommendations.length > 0 && (
            <Grid columns="1" gap="4">
              {recommendations.map((job) => (
                <Card key={job.id} size="3" style={{ cursor: "pointer", transition: "all 0.2s" }}>
                  <Flex gap="4" align="start">
                    
                    {/* Logo & Match Score */}
                    <Flex direction="column" align="center" gap="2">
                      <Avatar 
                        size="5" 
                        fallback={job.logo} 
                        color="iris" 
                        variant="soft" 
                        radius="medium"
                      />
                      <Badge size="2" color="green" variant="solid">
                        {job.matchScore}% Match
                      </Badge>
                    </Flex>

                    {/* Job Info */}
                    <Box style={{ flex: 1 }}>
                      <Flex justify="between" align="start" mb="2">
                        <Box>
                          <Heading size="5" mb="1">{job.name}</Heading>
                          <Text size="2" color="gray" weight="medium">{job.company}</Text>
                        </Box>
                        <Text size="4" weight="bold" color="iris">
                          ${(job.salary / 1000).toFixed(0)}k
                        </Text>
                      </Flex>

                      <Flex gap="2" mb="3" wrap="wrap">
                        <Badge variant="soft">{job.category}</Badge>
                        <Badge variant="soft" color="gray">{job.location}</Badge>
                      </Flex>

                      {/* Match Reasons */}
                      <Box>
                        <Text size="2" weight="medium" mb="2">Why this is a great match:</Text>
                        <Flex direction="column" gap="1">
                          {job.matchReasons.map((reason, index) => (
                            <Flex key={index} gap="2" align="start">
                              <CheckCircledIcon color="var(--green-9)" width="16" height="16" style={{ marginTop: "2px" }} />
                              <Text size="2" color="gray">{reason}</Text>
                            </Flex>
                          ))}
                        </Flex>
                      </Box>

                      {/* Apply Button */}
                      <Button size="2" mt="3" style={{ cursor: "pointer" }}>
                        <RocketIcon />
                        View Details & Apply
                      </Button>
                    </Box>
                  </Flex>
                </Card>
              ))}
            </Grid>
          )}
        </Box>
      )}
    </Flex>
  );
}
