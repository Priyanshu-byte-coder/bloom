export function SafetyBanner() {
  return (
    <div className="px-4 py-3 text-xs text-muted-foreground border-t bg-muted/30">
      <p className="font-medium text-foreground/70 mb-1">Important Notice</p>
      <p>
        Bloom provides support but is <strong>not a replacement</strong> for professional mental health care.
      </p>
      <p className="mt-1">
        In crisis? Call <strong>988</strong> or text HOME to <strong>741741</strong>. Emergency: <strong>911</strong>.
      </p>
    </div>
  )
}
