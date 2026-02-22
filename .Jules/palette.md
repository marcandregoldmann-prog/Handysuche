## 2024-05-22 - Transient Notifications Accessibility
**Learning:** Transient visual notifications (like achievements) are completely invisible to screen readers without `role="alert"`.
**Action:** Always wrap temporary status messages or toasts in a container with `role="alert"` or `aria-live="polite"`.

## 2024-05-22 - Disabled Button Contrast
**Learning:** Using `opacity: 0.5` for disabled buttons often results in insufficient color contrast against the background.
**Action:** Use specific, high-contrast colors (e.g., grey on light grey) for disabled states instead of opacity to ensure readability while maintaining "disabled" visual cue.
