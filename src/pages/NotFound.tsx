import { useNavigate } from "react-router-dom";
import { Card, Button, Text, Stack } from "@mantine/core";
import { Home, ArrowLeft } from "lucide-react";

export function NotFound() {
  const navigate = useNavigate();

  return (
    <Stack align="center" gap="xl" pt="xl">
      <Text size="4rem" fw={900} ta="center">
        404
      </Text>
      <Text size="lg" c="dimmed" ta="center">
        Page not found. The page you're looking for doesn't exist or has been
        moved.
      </Text>
      <Card shadow="sm" padding="lg" radius="md" withBorder maw={400} w="100%">
        <Stack gap="md" align="center">
          <Button
            fullWidth
            size="md"
            color="teal"
            leftSection={<Home size={16} />}
            onClick={() => navigate("/")}
          >
            Go Home
          </Button>
          <Button
            fullWidth
            size="md"
            variant="default"
            leftSection={<ArrowLeft size={16} />}
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </Stack>
      </Card>
    </Stack>
  );
}
