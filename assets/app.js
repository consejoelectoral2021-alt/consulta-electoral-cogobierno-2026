(() => {
  const form = document.querySelector("#lookup-form");
  const input = document.querySelector("#cedula");
  const submit = document.querySelector("#submit");
  const message = document.querySelector("#message");
  const result = document.querySelector("#result");
  const printButton = document.querySelector("#print-result");
  const cfg = window.UTC_ELECTORAL_CONFIG || {};
  let turnstileToken = "";

  function loadTurnstile() {
    if (!cfg.turnstileSiteKey) return;
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () => window.turnstile?.render("#turnstile-widget", {
      sitekey: cfg.turnstileSiteKey,
      action: "electoral_lookup",
      callback: (token) => { turnstileToken = token; },
      "expired-callback": () => { turnstileToken = ""; },
      "error-callback": () => { turnstileToken = ""; }
    });
    document.head.append(script);
  }
  loadTurnstile();

  function showMessage(text, error = false) {
    message.textContent = text;
    message.className = `message${error ? " error" : ""}`;
    message.hidden = false;
  }

  function makeDirectionsUrl(record) {
    const latitude = Number(record.latitude);
    const longitude = Number(record.longitude);
    let destination = "";
    if (Number.isFinite(latitude) && latitude >= -90 && latitude <= 90 && Number.isFinite(longitude) && longitude >= -180 && longitude <= 180) {
      destination = `${latitude},${longitude}`;
    } else if (typeof record.address === "string" && record.address.trim() && !/pendiente de confirmación/i.test(record.address)) {
      destination = [record.address.trim(), record.campus, record.pollingPlace, "Ecuador"].filter(Boolean).join(", ");
    }
    if (destination) {
      const params = new URLSearchParams({ api: "1", destination, travelmode: "driving" });
      return `https://www.google.com/maps/dir/?${params.toString()}`;
    }
    return "";
  }

  function getSiteLocation(record) {
    const locations = cfg.siteLocations || {};
    const normalize = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es").trim();
    for (const candidate of [record.campus, record.pollingPlace]) {
      const location = locations[normalize(candidate)];
      if (location) return { ...record, ...location };
    }
    return record;
  }

  function validGoogleMapsUrl(value) {
    if (!value) return "";
    try {
      const url = new URL(value);
      const allowedHost = url.hostname === "maps.app.goo.gl" || url.hostname === "maps.google.com" || url.hostname === "www.google.com";
      return url.protocol === "https:" && allowedHost && (url.hostname !== "www.google.com" || url.pathname.startsWith("/maps")) ? url.href : "";
    } catch {
      return "";
    }
  }

  printButton?.addEventListener("click", () => window.print());

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const cedula = input.value.replace(/\D/g, "");
    result.hidden = true;
    message.hidden = true;
    if (!/^\d{10}$/.test(cedula)) return showMessage("Ingresa una cédula de 10 dígitos.", true);
    if (!cfg.apiBaseUrl) return showMessage("El servicio de consulta aún no está configurado.", true);
    if (!cfg.turnstileSiteKey || !turnstileToken) return showMessage("Completa la verificación de seguridad y vuelve a intentarlo.", true);
    submit.disabled = true;
    submit.textContent = "Consultando…";
    try {
      const response = await fetch(`${cfg.apiBaseUrl.replace(/\/$/, "")}/api/lookup`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cedula, turnstileToken })
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 404) return showMessage("No encontramos un registro para esa cédula. Verifica el número o comunícate con la UTC.");
      if (response.status === 429) return showMessage("Se alcanzó el límite de consultas. Espera unos minutos e inténtalo nuevamente.", true);
      if (response.status === 403) return showMessage("No se pudo validar la verificación de seguridad. Inténtalo nuevamente.", true);
      if (!response.ok || !data.record) throw new Error("lookup_failed");
      const r = data.record;
      const site = getSiteLocation(r);
      document.querySelector("#person-name").textContent = r.name;
      document.querySelector("#person-id").textContent = `C.I. ${r.cedula}`;
      document.querySelector("#place").textContent = r.pollingPlace;
      document.querySelector("#map-place").textContent = r.pollingPlace;
      document.querySelector("#station").textContent = r.station;
      document.querySelector("#campus").textContent = r.campus || "—";
      document.querySelector("#address").textContent = site.address || "Dirección pendiente de confirmación institucional.";
      const link = document.querySelector("#map-link");
      const directionsUrl = makeDirectionsUrl(site);
      if (directionsUrl) { link.href = directionsUrl; link.hidden = false; }
      else link.hidden = true;
      const sourceLink = document.querySelector("#map-source-link");
      const savedMapUrl = validGoogleMapsUrl(site.mapsUrl);
      if (savedMapUrl) { sourceLink.href = savedMapUrl; sourceLink.hidden = false; }
      else sourceLink.hidden = true;
      document.querySelector("#map-note").hidden = Boolean(directionsUrl);
      result.hidden = false;
      input.value = "";
    } catch {
      showMessage("No fue posible realizar la consulta. Inténtalo de nuevo más tarde.", true);
    } finally {
      window.turnstile?.reset();
      turnstileToken = "";
      submit.disabled = false;
      submit.textContent = "Consultar";
    }
  });
})();
