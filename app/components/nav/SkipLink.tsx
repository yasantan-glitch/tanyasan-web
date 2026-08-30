/**
 * Klavye kullanıcısının fixed header'ı atlayıp içeriğe geçmesi için ilk
 * durak. Odaklanana dek görünmez (bkz. .skip-link, globals.css).
 */
export default function SkipLink() {
  return (
    <a href="#icerik" className="skip-link btn btn-accent eyebrow">
      İçeriğe geç
    </a>
  );
}
