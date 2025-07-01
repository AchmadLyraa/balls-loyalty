// QR Code generation utility
import QRCode from "qrcode"

export async function generateQRCodeDataURL(text: string): Promise<string> {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(text, {
      errorCorrectionLevel: "M",
      type: "image/png",
      quality: 0.92,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      width: 256,
    })
    return qrCodeDataURL
  } catch (error) {
    console.error("QR Code generation error:", error)
    throw new Error("Failed to generate QR code")
  }
}

export async function generateQRCodeBuffer(text: string): Promise<Buffer> {
  try {
    const qrCodeBuffer = await QRCode.toBuffer(text, {
      errorCorrectionLevel: "M",
      type: "png",
      quality: 0.92,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      width: 256,
    })
    return qrCodeBuffer
  } catch (error) {
    console.error("QR Code generation error:", error)
    throw new Error("Failed to generate QR code")
  }
}
