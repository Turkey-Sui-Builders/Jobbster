import { useNavigate } from "react-router-dom";
import { Box, Button, Card, Container, Flex, Grid, Heading, Text, Avatar } from "@radix-ui/themes";
import { RocketIcon, LockClosedIcon, LightningBoltIcon, CheckCircledIcon } from "@radix-ui/react-icons";

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <Box>
      {/* --- HERO SECTION --- */}
      <Box 
        style={{ 
          background: "linear-gradient(135deg, var(--iris-9) 0%, var(--indigo-11) 100%)", 
          padding: "120px 0 100px 0",
          color: "white"
        }}
      >
        <Container size="3">
          <Flex direction="column" align="center" gap="6" style={{ textAlign: "center" }}>
            
            {/* Badge */}
            <Flex align="center" gap="2" style={{ background: "rgba(255,255,255,0.1)", padding: "8px 16px", borderRadius: "99px" }}>
              <Text size="2" weight="medium">🚀 Built on Sui Network</Text>
            </Flex>

            <Heading size="9" weight="bold" style={{ lineHeight: "1.1" }}>
              The Future of Hiring <br />
              is <Text style={{ color: "var(--cyan-9)" }}>Decentralized</Text>.
            </Heading>
            
            <Text size="5" style={{ maxWidth: "600px", opacity: 0.9 }}>
              Connect directly with top Web3 talent. Post jobs as on-chain objects, 
              hire with transparency, and pay instantly with SUI.
            </Text>

            <Button 
              size="4" 
              variant="solid" 
              color="cyan" 
              highContrast
              style={{ cursor: "pointer", fontWeight: "bold", padding: "0 40px" }}
              onClick={() => navigate("/jobs")}
            >
              Launch App
            </Button>
          </Flex>
        </Container>
      </Box>

      {/* --- FEATURES SECTION --- */}
      <Box py="9" style={{ backgroundColor: "var(--gray-2)" }}>
        <Container size="3">
          <Flex direction="column" align="center" mb="8">
            <Heading size="7" mb="3">Why Sui Job Board?</Heading>
            <Text color="gray" size="3">Leveraging the power of Move and Sui Objects.</Text>
          </Flex>

          <Grid columns={{ initial: "1", md: "3" }} gap="5" width="auto">
            
            {/* Feature 1 */}
            <Card size="3" style={{ padding: "20px" }}>
              <Flex gap="4" align="start" direction="column">
                <Avatar 
                  size="5" 
                  fallback={<LockClosedIcon width="24" height="24" />} 
                  color="iris" 
                  variant="soft" 
                />
                <Box>
                  <Heading size="4" mb="2">True Ownership</Heading>
                  <Text as="p" size="3" color="gray">
                    Every job post and application is a unique NFT-like Object on Sui. 
                    You own your data, not the platform.
                  </Text>
                </Box>
              </Flex>
            </Card>

            {/* Feature 2 */}
            <Card size="3" style={{ padding: "20px" }}>
              <Flex gap="4" align="start" direction="column">
                <Avatar 
                  size="5" 
                  fallback={<LightningBoltIcon width="24" height="24" />} 
                  color="cyan" 
                  variant="soft" 
                />
                <Box>
                  <Heading size="4" mb="2">Instant Settlements</Heading>
                  <Text as="p" size="3" color="gray">
                    Experience the blazing speed of Sui. Pay salaries or listing fees 
                    instantly with near-zero gas costs.
                  </Text>
                </Box>
              </Flex>
            </Card>

            {/* Feature 3 */}
            <Card size="3" style={{ padding: "20px" }}>
              <Flex gap="4" align="start" direction="column">
                <Avatar 
                  size="5" 
                  fallback={<CheckCircledIcon width="24" height="24" />} 
                  color="grass" 
                  variant="soft" 
                />
                <Box>
                  <Heading size="4" mb="2">Verified Profiles</Heading>
                  <Text as="p" size="3" color="gray">
                    Employer reputation and candidate history are verifiable on-chain, 
                    creating a trustless hiring environment.
                  </Text>
                </Box>
              </Flex>
            </Card>

          </Grid>
        </Container>
      </Box>

      {/* --- FOOTER --- */}
      <Box py="6" style={{ borderTop: "1px solid var(--gray-4)" }}>
        <Container size="3">
            <Flex justify="between" align="center">
                <Text size="2" color="gray">© 2024 Sui Job Board. All rights reserved.</Text>
                <Flex gap="4">
                    <Text size="2" color="gray">Privacy</Text>
                    <Text size="2" color="gray">Terms</Text>
                </Flex>
            </Flex>
        </Container>
      </Box>
    </Box>
  );
}