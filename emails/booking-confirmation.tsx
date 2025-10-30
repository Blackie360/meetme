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
                <Text style={label}>Meeting Link:</Text>
                <Link href={meetingLink} style={link}>
                  {meetingLink}
                </Link>
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
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "560px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0",
};

const section = {
  padding: "0 48px",
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0",
};

const label = {
  color: "#666",
  fontSize: "14px",
  fontWeight: "bold",
  margin: "16px 0 4px",
};

const value = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 16px",
};

const link = {
  color: "#2754C5",
  textDecoration: "underline",
};

