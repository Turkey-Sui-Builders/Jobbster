import { Box, Card, Flex, Heading, Text, TextField, Button, Avatar, ScrollArea } from "@radix-ui/themes";
import { ChatBubbleIcon, Cross2Icon, PaperPlaneIcon } from "@radix-ui/react-icons";
import { useState } from "react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "jobo";
  timestamp: Date;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    text: "Hi! I'm Jobo, your job board assistant! 🎯 How can I help you today?",
    sender: "jobo",
    timestamp: new Date()
  }
];

const QUICK_REPLIES = [
  "How do I post a job?",
  "How do I apply for a job?",
  "What are the job categories?",
  "How does the blockchain work here?"
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponse = generateResponse(text);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: "jobo",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const generateResponse = (userText: string): string => {
    const lowerText = userText.toLowerCase();

    if (lowerText.includes("post") || lowerText.includes("create") || lowerText.includes("job")) {
      return "To post a job, click the '+ Post Job' button in the navigation bar. You'll need to fill in details like job title, company name, location, category, description, salary, and deadline. The job will be stored on the Sui blockchain! 📝";
    }
    
    if (lowerText.includes("apply") || lowerText.includes("application")) {
      return "To apply for a job, browse the 'All Jobs' page, click on a job card to view details, and then click the 'Apply' button. You'll need to provide your resume link and a cover letter. Your application will be recorded on-chain! 🚀";
    }
    
    if (lowerText.includes("category") || lowerText.includes("categories")) {
      return "We have 8 job categories: Engineering, Design, Security, Business Development, Accounting, Infrastructure, Marketing, and Product Management. You can filter jobs by category on the jobs page! 🏷️";
    }
    
    if (lowerText.includes("blockchain") || lowerText.includes("sui") || lowerText.includes("web3")) {
      return "This platform uses Sui blockchain to store job postings and applications. Each job is a shared object on-chain, and employers receive an EmployerCap that gives them authority to manage their listings. Applications are also stored on-chain for transparency! ⛓️";
    }
    
    if (lowerText.includes("dashboard")) {
      return "Your Dashboard shows all your job applications and their current status (Applied, Viewed, Interview, Offer, or Rejected). You can track your progress from there! 📊";
    }

    if (lowerText.includes("help") || lowerText.includes("hi") || lowerText.includes("hello")) {
      return "I'm here to help you navigate the platform! You can ask me about posting jobs, applying for positions, using the dashboard, or how blockchain works here. What would you like to know? 💡";
    }

    return "That's a great question! I can help you with posting jobs, applying for positions, understanding categories, and explaining how our blockchain integration works. What would you like to know more about? 🤔";
  };

  const handleQuickReply = (reply: string) => {
    handleSendMessage(reply);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <Box
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 1000
        }}
      >
        {!isOpen ? (
          <Button
            size="4"
            style={{
              borderRadius: "50%",
              width: "64px",
              height: "64px",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
            }}
            onClick={() => setIsOpen(true)}
          >
            <ChatBubbleIcon width="28" height="28" />
          </Button>
        ) : (
          <Card
            size="4"
            style={{
              width: "380px",
              height: "600px",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)"
            }}
          >
            {/* Header */}
            <Flex
              justify="between"
              align="center"
              p="4"
              style={{
                borderBottom: "1px solid var(--gray-a6)",
                backgroundColor: "var(--accent-3)"
              }}
            >
              <Flex align="center" gap="3">
                <Avatar
                  size="3"
                  fallback="J"
                  color="iris"
                  radius="full"
                />
                <Box>
                  <Heading size="4">Jobo Assistant</Heading>
                  <Text size="1" color="gray">Always here to help! 🤖</Text>
                </Box>
              </Flex>
              <Button
                variant="ghost"
                size="2"
                onClick={() => setIsOpen(false)}
                style={{ cursor: "pointer" }}
              >
                <Cross2Icon width="20" height="20" />
              </Button>
            </Flex>

            {/* Messages Area */}
            <ScrollArea
              style={{
                flex: 1,
                padding: "16px",
                backgroundColor: "var(--gray-1)"
              }}
            >
              <Flex direction="column" gap="3">
                {messages.map((message) => (
                  <Flex
                    key={message.id}
                    justify={message.sender === "user" ? "end" : "start"}
                  >
                    <Box
                      style={{
                        maxWidth: "75%",
                        padding: "12px 16px",
                        borderRadius: "12px",
                        backgroundColor: message.sender === "user" 
                          ? "var(--accent-9)" 
                          : "var(--gray-3)",
                        color: message.sender === "user" 
                          ? "white" 
                          : "var(--gray-12)"
                      }}
                    >
                      <Text size="2">{message.text}</Text>
                    </Box>
                  </Flex>
                ))}

                {isTyping && (
                  <Flex justify="start">
                    <Box
                      style={{
                        padding: "12px 16px",
                        borderRadius: "12px",
                        backgroundColor: "var(--gray-3)"
                      }}
                    >
                      <Text size="2" color="gray">Jobo is typing...</Text>
                    </Box>
                  </Flex>
                )}
              </Flex>
            </ScrollArea>

            {/* Quick Replies */}
            {messages.length <= 2 && (
              <Box p="3" style={{ borderTop: "1px solid var(--gray-a4)" }}>
                <Text size="1" color="gray" mb="2" style={{ display: "block" }}>
                  Quick questions:
                </Text>
                <Flex gap="2" wrap="wrap">
                  {QUICK_REPLIES.map((reply, index) => (
                    <Button
                      key={index}
                      size="1"
                      variant="soft"
                      onClick={() => handleQuickReply(reply)}
                      style={{ cursor: "pointer" }}
                    >
                      {reply}
                    </Button>
                  ))}
                </Flex>
              </Box>
            )}

            {/* Input Area */}
            <Box
              p="3"
              style={{
                borderTop: "1px solid var(--gray-a6)",
                backgroundColor: "var(--gray-2)"
              }}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputValue);
                }}
              >
                <Flex gap="2" align="end">
                  <TextField.Root
                    placeholder="Ask me anything..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    size="3"
                    style={{ flex: 1 }}
                  />
                  <Button
                    type="submit"
                    size="3"
                    disabled={!inputValue.trim() || isTyping}
                    style={{ cursor: "pointer" }}
                  >
                    <PaperPlaneIcon />
                  </Button>
                </Flex>
              </form>
            </Box>
          </Card>
        )}
      </Box>
    </>
  );
}
