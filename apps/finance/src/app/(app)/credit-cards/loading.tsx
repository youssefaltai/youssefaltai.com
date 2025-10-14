import { Container, Stack, Skeleton } from '@mantine/core'

export default function Loading() {
  return (
    <Container size="lg" py="md" px="md" pb={96}>
      <Stack gap="md">
        <Skeleton height={80} radius="md" />
        <Skeleton height={80} radius="md" />
        <Skeleton height={80} radius="md" />
        <Skeleton height={80} radius="md" />
      </Stack>
    </Container>
  )
}
