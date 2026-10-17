export class SourceFetchError extends Error {
  constructor(
    public code: string,
    public httpStatus: number | null = null,
    public contentType: string | null = null,
  ) {
    super(code);
  }
}
function officialUrl(value: string) {
  const url = new URL(value);
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    (url.port && url.port !== "443") ||
    !/\.(edu|gov)\.cn$/i.test(url.hostname)
  ) {
    throw new SourceFetchError("SOURCE_URL_NOT_ALLOWED");
  }
  return url;
}
// Same allow-list the fetcher enforces, so importers can reject a source before registering it.
export function isOfficialSourceUrl(value: string) {
  try {
    officialUrl(value);
    return true;
  } catch {
    return false;
  }
}
export async function fetchSource(value: string) {
  let url = officialUrl(value);
  const signal = AbortSignal.timeout(20_000);
  try {
    for (let redirect = 0; redirect < 6; redirect++) {
      const response = await fetch(url, { redirect: "manual", signal });
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get("location");
        await response.body?.cancel();
        if (!location)
          throw new SourceFetchError(
            "REDIRECT_WITHOUT_LOCATION",
            response.status,
          );
        url = officialUrl(new URL(location, url).href);
        continue;
      }
      const contentType = response.headers.get("content-type") ?? "";
      if (!response.ok) {
        await response.body?.cancel();
        throw new SourceFetchError("HTTP_ERROR", response.status, contentType);
      }
      if (!/text\/|application\/(pdf|json)/i.test(contentType)) {
        await response.body?.cancel();
        throw new SourceFetchError(
          "UNSUPPORTED_CONTENT",
          response.status,
          contentType,
        );
      }
      const reader = response.body?.getReader();
      if (!reader)
        throw new SourceFetchError("EMPTY_BODY", response.status, contentType);
      const chunks: Uint8Array[] = [];
      let size = 0;
      while (true) {
        const { done, value: chunk } = await reader.read();
        if (done) break;
        size += chunk.byteLength;
        if (size > 20 * 1024 * 1024) {
          await reader.cancel();
          throw new SourceFetchError(
            "SOURCE_TOO_LARGE",
            response.status,
            contentType,
          );
        }
        chunks.push(chunk);
      }
      return {
        body: Buffer.concat(chunks),
        contentType,
        httpStatus: response.status,
      };
    }
    throw new SourceFetchError("TOO_MANY_REDIRECTS");
  } catch (error) {
    if (error instanceof SourceFetchError) throw error;
    throw new SourceFetchError(signal.aborted ? "TIMEOUT" : "NETWORK_ERROR");
  }
}
