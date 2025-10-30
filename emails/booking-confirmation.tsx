import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface BookingConfirmationEmailProps {
  guestName: string;
  hostName: string;
  startTime: Date;
  endTime: Date;
  title: string;
  description?: string;
  meetingLink?: string;
  isHost?: boolean;
}

export function BookingConfirmationEmail({
  guestName,
  hostName,
  startTime,
  endTime,
  title,
  description,
  meetingLink,
  isHost = false,
}: BookingConfirmationEmailProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(date);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(date);
  };

  return (
    <Html>
      <Head />
      <Preview>
        {isHost
          ? `New booking: ${title} with ${guestName}`
          : `Booking confirmed: ${title}`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>
            {isHost ? "New Booking Received" : "Booking Confirmed"}
          </Heading>

          <Section style={section}>
            <Text style={text}>
              {isHost ? (
                <>
                  You have a new booking for <strong>{title}</strong> with{" "}
                  <strong>{guestName}</strong>.
                </>
              ) : (
                <>
                  Hello <strong>{guestName}</strong>,
                </>
              )}
            </Text>

            <Text style={text}>
              {isHost
                ? "Booking details:"
                : "Your booking has been confirmed! Here are the details:"}
            </Text>
          </Section>

          <Section style={section}>
            <Text style={label}>Title:</Text>
            <Text style={value}>{title}</Text>

            {description && (
              <>
                <Text style={label}>Description:</Text>
                <Text style={value}>{description}</Text>
              </>
            )}

            <Text style={label}>Date & Time:</Text>
            <Text style={value}>
              {formatDate(startTime)} from {formatTime(startTime)} to{" "}
              {formatTime(endTime)}
            </Text>

            {isHost ? (
              <>
                <Text style={label}>Guest:</Text>
                <Text style={value}>{guestName}</Text>
              </>
            ) : (
              <>
                <Text style={label}>Host:</Text>
                <Text style={value}>{hostName}</Text>
              </>
            )}

            {meetingLink && (
              <>
                <Text style={label}>Join Google Meet:</Text>
                <Link href={meetingLink} style={link}>
                  Join Meeting
                </Link>
                <Text style={subtle}>
                  Can&apos;t click the button? Open this URL in your browser:
                  <br />
                  <span>{meetingLink}</span>
                </Text>
              </>
            )}
          </Section>

          <Section style={section}>
            <Text style={text}>
              {isHost
                ? "Please make sure you're available at the scheduled time."
                : "We're looking forward to meeting with you!"}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f4f8f9",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "32px 0 56px",
  maxWidth: "600px",
  backgroundColor: "#ffffff",
  borderRadius: "16px",
  boxShadow: "0 20px 45px rgba(15, 118, 110, 0.1)",
  border: "1px solid #d9ece9",
};

const h1 = {
  color: "#0f766e",
  fontSize: "26px",
  fontWeight: "bold",
  margin: "24px 0 12px",
  padding: "0",
  textAlign: "center" as const,
};

const section = {
  padding: "0 48px",
};

const text = {
  color: "#1f2933",
  fontSize: "15px",
  lineHeight: "26px",
  margin: "16px 0",
};

const label = {
  color: "#0f766e",
  fontSize: "12px",
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  margin: "24px 0 6px",
};

const value = {
  color: "#1f2933",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 16px",
};

const link = {
  display: "inline-block",
  backgroundColor: "#0f766e",
  color: "#ffffff",
  fontWeight: 600,
  padding: "12px 26px",
  borderRadius: "9999px",
  textDecoration: "none",
  marginTop: "8px",
};

const subtle = {
  color: "#64748b",
  fontSize: "13px",
  margin: "12px 0 0",
  lineHeight: "20px",
};

