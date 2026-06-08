import type { Metadata } from "next";
import "../styles/global.scss";
import StyledComponentsRegistry from "./ant-registry";
import { ConfigProvider } from "antd";

export const metadata: Metadata = {
  title: "Log Dashboard",
  description: "Hệ thống giám sát nhật kí",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body>
        <StyledComponentsRegistry>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: "#0ea5e9",
                borderRadius: 8,
              },
            }}
          >
            {children}
          </ConfigProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
