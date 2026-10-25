namespace Ranum.Api.Validation;

public static class ImageData
{
    public const string JpegPrefix = "data:image/jpeg;base64,";

    // Only accept a real base64 JPEG so stored values are always safe to use as <img src>
    public static bool IsJpegDataUrl(string value) =>
        value.StartsWith(JpegPrefix)
        && Convert.TryFromBase64String(value[JpegPrefix.Length..], new byte[value.Length], out _);

    public const string PdfPrefix = "data:application/pdf;base64,";
    public const int MaxPdfBytes = 5 * 1024 * 1024;

    // A base64 PDF up to 5 MB whose bytes really start with the %PDF- signature
    public static bool IsPdfDataUrl(string value)
    {
        if (!value.StartsWith(PdfPrefix))
            return false;
        var buffer = new byte[value.Length];
        return Convert.TryFromBase64String(value[PdfPrefix.Length..], buffer, out var length)
            && length <= MaxPdfBytes
            && buffer.AsSpan(0, length).StartsWith("%PDF-"u8);
    }
}
