import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  render,
} from '@react-email/components';
import * as React from 'react';

interface PsicoreinventarVerifyEmailProps {
  verificationCode: string;
  confirmationLink: string;
}

export default function PsicoreinventarVerifyEmail({
  verificationCode,
  confirmationLink,
}: PsicoreinventarVerifyEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Psicoreinventar Email Verification</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={coverSection}>
            <Section style={imageSection}>
              <Img
                src={`https://res.cloudinary.com/dzgjxwvnw/image/upload/v1720212860/psicoreinventar/wnhx96f5n7ptqxacj2qq.png`}
                width='42'
                height='42'
                alt='Psicoreinventar Logo'
              />
            </Section>
            <Section style={upperSection}>
              <Heading style={h1}>Verify your email address</Heading>
              <Text style={mainText}>
                To verify your email address, please use the following One Time Password (OTP):
              </Text>
              <Section>
                <Text style={verifyText}>Verification code</Text>

                <Text style={codeText}>{verificationCode}</Text>
                <Text style={validityText}>(This code is valid for 30 minutes)</Text>
              </Section>
              <Section style={buttonSection}>
                <Link href={confirmationLink} style={buttonStyle}>
                  Verify Email
                </Link>
              </Section>
            </Section>
            <Hr />
          </Section>
          <Text style={footerText}>
            This message was produced and distributed by Psicoreinventar. © 2024. All rights
            reserved.{' '}
            <Link href='https://psicoreinventar.com' target='_blank' style={link}>
              Psicoreinventar
            </Link>
            .
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export const VerificationEmailHtml = (props: PsicoreinventarVerifyEmailProps) =>
  render(<PsicoreinventarVerifyEmail {...props} />, {
    pretty: true,
  });

const main = {
  backgroundColor: '#fff',
  color: '#212121',
};

const container = {
  padding: '20px',
  margin: '0 auto',
  backgroundColor: '#eee',
};

const h1 = {
  color: '#333',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '20px',
  fontWeight: 'bold',
  marginBottom: '15px',
};

const link = {
  color: '#2754C5',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '14px',
  textDecoration: 'underline',
};

const text = {
  color: '#333',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '14px',
  margin: '24px 0',
};

const imageSection = {
  backgroundColor: '#252f3d',
  display: 'flex',
  padding: '20px 0',
  alignItems: 'center',
  justifyContent: 'center',
};

const coverSection = { backgroundColor: '#fff' };

const upperSection = { padding: '25px 35px' };

const lowerSection = { padding: '25px 35px' };

const footerText = {
  ...text,
  fontSize: '12px',
  padding: '0 20px',
};

const verifyText = {
  ...text,
  margin: 0,
  fontWeight: 'bold',
  textAlign: 'center' as const,
};

const codeText = {
  ...text,
  fontWeight: 'bold',
  fontSize: '36px',
  margin: '10px 0',
  textAlign: 'center' as const,
};

const validityText = {
  ...text,
  margin: '0px',
  textAlign: 'center' as const,
};

const mainText = { ...text, marginBottom: '14px' };

const cautionText = { ...text, margin: '0px' };

const buttonSection = {
  marginTop: '20px',
  textAlign: 'center' as const,
};

const buttonStyle = {
  backgroundColor: '#2754C5',
  color: '#fff',
  padding: '10px 20px',
  borderRadius: '5px',
  textDecoration: 'none',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: '14px',
};
