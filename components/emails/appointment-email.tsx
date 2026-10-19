import {
  Body,
  Column,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  render,
  Row,
  Section,
  Text,
} from "@react-email/components";
import { format } from "date-fns";

interface ReceiptEmailProps {
  email: string;
  date: Date;
  appointmentId: string;
  patient: string;
  product: any; // Product type to be redefined
}

export const ReceiptEmail = ({
  email,
  date,
  appointmentId,
  patient,
  product,
}: ReceiptEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your Psicoreinventar receipt</Preview>
      <Body style={main}>
        <Container style={container}>
          <div style={accentBar} />

          <Section style={contentSection}>
            {/* Header row: wordmark + receipt label */}
            <Row>
              <Column>
                <Text style={wordmark}>psicoreinventar</Text>
              </Column>
              <Column align="right">
                <Text style={receiptLabel}>Receipt</Text>
              </Column>
            </Row>

            {/* Info table */}
            <Section style={infoSection}>
              <Row style={infoRow}>
                <Column style={infoColumn}>
                  <Text style={infoLabel}>EMAIL</Text>
                  <Link style={infoValue}>{email}</Link>
                </Column>
                <Column style={infoColumn}>
                  <Text style={infoLabel}>BILLED TO</Text>
                  <Text style={infoValue}>{patient}</Text>
                </Column>
              </Row>
              <Row style={infoRow}>
                <Column style={infoColumn}>
                  <Text style={infoLabel}>DATE</Text>
                  <Text style={infoValue}>{format(date, "dd MMM yyyy")}</Text>
                </Column>
                <Column style={infoColumn}>
                  <Text style={infoLabel}>APPOINTMENT ID</Text>
                  <Text style={infoValue}>{appointmentId}</Text>
                </Column>
              </Row>
            </Section>

            <Hr style={divider} />

            {/* Product row */}
            <Section style={productSection}>
              <Row>
                <Column>
                  <Text style={productName}>{product.name}</Text>
                  <Text style={productDesc}>
                    {product.description.length > 60
                      ? product.description.slice(0, 60) + "..."
                      : product.description}
                  </Text>
                </Column>
                <Column align="right">
                  <Text style={productPrice}>${product.price}.99</Text>
                </Column>
              </Row>
            </Section>

            <Hr style={divider} />

            {/* Total */}
            <Row style={totalRow}>
              <Column>
                <Text style={totalLabel}>TOTAL</Text>
              </Column>
              <Column align="right">
                <Text style={totalAmount}>${product.price}.99</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>The Psicoreinventar Team</Text>
        </Container>
      </Body>
    </Html>
  );
};

export default ReceiptEmail;

export const ReceiptEmailHtml = (props: ReceiptEmailProps) =>
  render(<ReceiptEmail {...props} />, {
    pretty: true,
  });

const main = {
  backgroundColor: "#f9fafb",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "40px auto",
  maxWidth: "500px",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  overflow: "hidden" as const,
};

const accentBar = {
  height: "3px",
  backgroundColor: "#c4b5fd",
  width: "100%",
};

const contentSection = {
  padding: "36px 40px 28px",
};

const wordmark = {
  fontSize: "13px",
  fontWeight: "400",
  letterSpacing: "0.08em",
  color: "#9ca3af",
  textTransform: "uppercase" as const,
  margin: "0",
};

const receiptLabel = {
  fontSize: "13px",
  fontWeight: "400",
  letterSpacing: "0.06em",
  color: "#9ca3af",
  textTransform: "uppercase" as const,
  margin: "0",
};

const infoSection = {
  marginTop: "28px",
  marginBottom: "4px",
};

const infoRow = {
  marginBottom: "16px",
};

const infoColumn = {
  paddingRight: "20px",
  verticalAlign: "top" as const,
};

const infoLabel = {
  fontSize: "10px",
  fontWeight: "500",
  letterSpacing: "0.08em",
  color: "#9ca3af",
  textTransform: "uppercase" as const,
  margin: "0 0 2px",
};

const infoValue = {
  fontSize: "14px",
  fontWeight: "400",
  color: "#374151",
  margin: "0",
  lineHeight: "1.4",
};

const divider = {
  borderColor: "#f3f4f6",
  margin: "20px 0",
};

const productSection = {
  marginBottom: "4px",
};

const productName = {
  fontSize: "15px",
  fontWeight: "500",
  color: "#1f2937",
  margin: "0 0 4px",
};

const productDesc = {
  fontSize: "13px",
  fontWeight: "400",
  color: "#9ca3af",
  margin: "0",
  lineHeight: "1.5",
};

const productPrice = {
  fontSize: "15px",
  fontWeight: "400",
  color: "#374151",
  margin: "0",
};

const totalRow = {
  marginTop: "4px",
};

const totalLabel = {
  fontSize: "11px",
  fontWeight: "500",
  letterSpacing: "0.08em",
  color: "#9ca3af",
  textTransform: "uppercase" as const,
  margin: "0",
};

const totalAmount = {
  fontSize: "20px",
  fontWeight: "500",
  color: "#1f2937",
  margin: "0",
};

const hr = {
  borderColor: "#f3f4f6",
  margin: "0",
};

const footer = {
  fontSize: "13px",
  color: "#9ca3af",
  fontWeight: "400",
  padding: "20px 40px",
  margin: "0",
};
