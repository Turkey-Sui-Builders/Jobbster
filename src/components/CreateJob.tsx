import { Box, Card, Flex, Heading, Text, TextField, TextArea, Button, Select } from "@radix-ui/themes";
import { RocketIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useQueryClient } from "@tanstack/react-query";
import suiLogo from "../assets/sui_sea.png";

// Categories matching the smart contract
const CATEGORIES = [
  "Engineering",
  "Design",
  "Security",
  "Business Development",
  "Accounting",
  "Software Developer",
  "Marketing",
  "Product Management"
];

export default function CreateJob() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const suiClient = useSuiClient();
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();
  const account = useCurrentAccount();

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    location: "",
    category: "",
    description: "",
    salary: "",
    deadline: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!account?.address) {
      alert("Please connect your wallet first");
      return;
    }

    setIsSubmitting(true);

    try {
      const tx = new Transaction();
      
      // Convert deadline to timestamp (milliseconds)
      const deadlineTimestamp = new Date(formData.deadline).getTime();
      
      // Prepare salary as Option<u64>
      const salaryValue = formData.salary ? parseInt(formData.salary) : null;

      // Call create_job function from smart contract
      tx.moveCall({
        target: `${import.meta.env.VITE_PACKAGE_ID}::job_hire::create_job`,
        arguments: [
          tx.object(import.meta.env.VITE_JOB_BOARD_ID), // job_board: &mut JobBoard
          tx.object(import.meta.env.VITE_VERSION_ID), // version: &Version
          tx.pure.string(formData.company), // company: vector<u8>
          tx.pure.string(formData.location), // location: vector<u8>
          tx.pure.string(formData.category), // category: vector<u8>
          tx.pure.string(formData.name), // name: vector<u8>
          tx.pure.string(formData.description), // description: vector<u8>
          salaryValue !== null 
            ? tx.pure.option("u64", salaryValue) 
            : tx.pure.option("u64", null), // salary: option::Option<u64>
          tx.pure.u64(deadlineTimestamp), // deadline: u64
        ],
      });

      // Sign and execute transaction
      const result = await signAndExecute({ transaction: tx });
      
      // Wait for transaction confirmation
      await suiClient.waitForTransaction({
        digest: result.digest,
      });

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "testnet" &&
          query.queryKey[1] === "getOwnedObjects",
      });

      alert("Job posted successfully on the blockchain!");
      navigate("/jobs");
    } catch (error) {
      console.error("Error creating job:", error);
      alert("Failed to create job. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = formData.name && formData.company && formData.location && formData.category && formData.description && formData.deadline;

  return (
    <Flex direction="column" gap="6" style={{ maxWidth: "800px", margin: "0 auto" }}>
      
      {/* Header */}
      <Box>
        <Heading size="8" mb="2">Post a New Job</Heading>
        <Text color="gray" size="4">
          Create a job listing on the blockchain. All fields marked with * are required.
        </Text>
      </Box>

      {/* Form Card */}
      <Card size="3">
        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap="5">
            
            {/* Job Name */}
            <Box>
              <Text size="2" weight="medium" mb="2">Job Title *</Text>
              <TextField.Root
                size="3"
                placeholder="e.g., Senior Move Developer"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
              <Text size="1" color="gray" mt="1">
                The title of the position you're hiring for
              </Text>
            </Box>

            {/* Company Name */}
            <Box>
              <Text size="2" weight="medium" mb="2">Company Name *</Text>
              <TextField.Root
                size="3"
                placeholder="e.g., Mysten Labs"
                value={formData.company}
                onChange={(e) => handleChange("company", e.target.value)}
                required
              />
              <Text size="1" color="gray" mt="1">
                Your company or organization name
              </Text>
            </Box>

            {/* Location */}
            <Box>
              <Text size="2" weight="medium" mb="2">Location *</Text>
              <TextField.Root
                size="3"
                placeholder="e.g., Remote, San Francisco, or Istanbul"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                required
              />
              <Text size="1" color="gray" mt="1">
                Job location (Remote, city name, or hybrid)
              </Text>
            </Box>

            {/* Category */}
            <Box>
              <Text size="2" weight="medium" mb="2">Category *</Text>
              <Select.Root
                size="3"
                value={formData.category}
                onValueChange={(value) => handleChange("category", value)}
                required
              >
                <Select.Trigger placeholder="Select a category" style={{ width: "100%" }} />
                <Select.Content>
                  {CATEGORIES.map((category) => (
                    <Select.Item key={category} value={category}>
                      {category}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
              <Text size="1" color="gray" mt="1">
                Choose the category that best fits this role
              </Text>
            </Box>

            {/* Description */}
            <Box>
              <Text size="2" weight="medium" mb="2">Job Description *</Text>
              <TextArea
                size="3"
                placeholder="Describe the role, responsibilities, requirements, and what makes this opportunity exciting..."
                rows={8}
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                required
              />
              <Text size="1" color="gray" mt="1">
                Provide a detailed description of the role and requirements
              </Text>
            </Box>

            {/* Salary */}
            <Box>
              <Text size="2" weight="medium" mb="2">Annual Salary (USD)</Text>
              <TextField.Root
                size="3"
                type="number"
                placeholder="e.g., 120000"
                value={formData.salary}
                onChange={(e) => handleChange("salary", e.target.value)}
                min="0"
                step="1000"
              />
              <Text size="1" color="gray" mt="1">
                Optional: Specify the annual salary for this position
              </Text>
            </Box>

            {/* Deadline */}
            <Box>
              <Text size="2" weight="medium" mb="2">Application Deadline *</Text>
              <TextField.Root
                size="3"
                type="date"
                value={formData.deadline}
                onChange={(e) => handleChange("deadline", e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />
              <Text size="1" color="gray" mt="1">
                Last date to accept applications for this position
              </Text>
            </Box>

            {/* Info Box */}
            <Card style={{ 
              backgroundColor: "var(--accent-2)", 
              border: "1px solid var(--accent-6)",
              padding: "16px"
            }}>
              <Flex align="center" gap="3">
                <img 
                  src={suiLogo}
                  alt="Sui Logo" 
                  style={{ width: "30px", height: "40px" }}
                />
                <Box style={{ flex: 1 }}>
                  <Text size="3" weight="bold" mb="1" style={{ display: "block" }}>
                    Posting Fee: 5 SUI
                  </Text>
                </Box>
              </Flex>
            </Card>

            {/* Action Buttons */}
            <Flex gap="3" mt="2">
              <Button
                type="submit"
                size="3"
                style={{ flex: 1 }}
                disabled={!isFormValid || isSubmitting}
              >
                {isSubmitting ? (
                  <>Creating Job...</>
                ) : (
                  <>
                    <RocketIcon />
                    Post Job Listing
                  </>
                )}
              </Button>
              <Button
                type="button"
                size="3"
                variant="soft"
                color="gray"
                onClick={() => navigate("/jobs")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </Flex>
          </Flex>
        </form>
      </Card>
      
    </Flex>
  );
}
