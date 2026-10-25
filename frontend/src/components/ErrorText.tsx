// Renders nothing when there is no error, so it can sit in every form unconditionally
export default function ErrorText({ error }: { error: string }) {
  return error ? <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p> : null
}
