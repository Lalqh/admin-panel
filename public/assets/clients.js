(function () {
  const API_STORE = "/api.php?controller=client&action=store";
  const API_INDEX = "/api.php?controller=client&action=index";
  const API_UPDATE = "/api.php?controller=client&action=update";
  const API_DELETE = "/api.php?controller=client&action=delete";

  const state = {
    page: 1,
    limit: 10,
    lastSearch: "",
    totalPages: 1,
    byId: new Map(),
  };

  const bootTimer = setInterval(() => {
    if (document.getElementById("tableBody")) {
      clearInterval(bootTimer);
      loadClients(1);
    }
  }, 150);

  document.addEventListener(
    "submit",
    async (e) => {
      const form = e.target;
      if (!form || form.id !== "clientForm") return;

      e.preventDefault();
      ensureClientMessageContainer();

      const id = (document.getElementById("clientId")?.value ?? "").trim();
      if (id) {
        await updateClient(Number(id));
      } else {
        await createClient();
      }
    },
    true,
  );

  function getValue(id) {
    return (document.getElementById(id)?.value ?? "").trim();
  }

  function ensureClientMessageContainer() {
    const form = document.getElementById("clientForm");
    if (!form) return;

    let el = document.getElementById("clientMessage");
    if (el) return;

    el = document.createElement("div");
    el.id = "clientMessage";
    el.className = "mt-3 small";
    form.appendChild(el);
  }

  function showClientMessage(msg, type = "danger") {
    const el = document.getElementById("clientMessage");
    if (!el) return;
    el.innerHTML = `<div class="alert alert-${type} py-2 mb-0" role="alert">${escapeHtml(msg)}</div>`;
  }

  function clearClientMessage() {
    const el = document.getElementById("clientMessage");
    if (el) el.innerHTML = "";
  }

  function setFormMode(mode /* 'create' | 'edit' */) {
    const title = document.getElementById("formTitle");
    const badge = document.getElementById("formModeBadge");
    const submitBtn = document.getElementById("submitBtn");
    const cancelBtn = document.getElementById("cancelEditBtn");

    if (mode === "edit") {
      if (title) title.textContent = "Actualizar cliente";
      if (badge) {
        badge.textContent = "EDITAR";
        badge.className = "badge text-bg-warning";
      }
      if (submitBtn) {
        submitBtn.textContent = "Actualizar";
        submitBtn.className = "btn btn-warning fw-semibold";
      }
      if (cancelBtn) cancelBtn.hidden = false;
    } else {
      if (title) title.textContent = "Crear cliente";
      if (badge) {
        badge.textContent = "CREAR";
        badge.className = "badge text-bg-secondary";
      }
      if (submitBtn) {
        submitBtn.textContent = "Guardar";
        submitBtn.className = "btn btn-success fw-semibold";
      }
      if (cancelBtn) cancelBtn.hidden = true;
    }
  }

  function validateClientPayload(payload) {
    const required = [
      { key: "nombres", label: "Nombres" },
      { key: "apellido_paterno", label: "Apellido paterno" },
      { key: "apellido_materno", label: "Apellido materno" },
      { key: "domicilio", label: "Domicilio" },
      { key: "email", label: "Email" },
    ];

    for (const f of required) {
      if (!payload[f.key]) return `Campo obligatorio: ${f.label}`;
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email);
    if (!emailOk) return "Email inválido.";

    return null;
  }

  async function createClient() {
    clearClientMessage();

    const form = document.getElementById("clientForm");
    if (!form) return;

    form.classList.add("was-validated");

    const payload = {
      nombres: getValue("nombres"),
      apellido_paterno: getValue("apellido_paterno"),
      apellido_materno: getValue("apellido_materno"),
      domicilio: getValue("domicilio"),
      email: getValue("email"),
    };

    const validationError = validateClientPayload(payload);
    if (validationError) {
      showClientMessage(validationError, "warning");
      return;
    }

    try {
      const res = await fetch(API_STORE, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await safeJson(res);
      if (!res.ok || !data.success) {
        showClientMessage(data.message || "Error al crear cliente", "danger");
        return;
      }

      showClientMessage(
        data.message || "Cliente creado correctamente",
        "success",
      );
      form.reset();
      form.classList.remove("was-validated");
      setFormMode("create");

      await loadClients(1);
    } catch (err) {
      console.error("Error en createClient:", err);
      showClientMessage("Error de conexión", "danger");
    }
  }

  async function updateClient(id) {
    clearClientMessage();

    const form = document.getElementById("clientForm");
    if (!form) return;

    form.classList.add("was-validated");

    const payload = {
      id,
      nombres: getValue("nombres"),
      apellido_paterno: getValue("apellido_paterno"),
      apellido_materno: getValue("apellido_materno"),
      domicilio: getValue("domicilio"),
      email: getValue("email"),
    };

    const validationError = validateClientPayload(payload);
    if (validationError) {
      showClientMessage(validationError, "warning");
      return;
    }

    try {
      const res = await fetch(API_UPDATE, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await safeJson(res);
      if (!res.ok || !data.success) {
        showClientMessage(
          data.message || "Error al actualizar cliente",
          "danger",
        );
        return;
      }

      showClientMessage(
        data.message || "Cliente actualizado correctamente",
        "success",
      );
      cancelEdit();
      await loadClients(state.page);
    } catch (err) {
      console.error("Error en updateClient:", err);
      showClientMessage("Error de conexión", "danger");
    }
  }

  async function deleteClient(id) {
    const client = state.byId.get(Number(id));
    const name = client
      ? `${client.nombres} ${client.apellido_paterno} ${client.apellido_materno}`.trim()
      : `ID ${id}`;

    if (!confirm(`¿Eliminar cliente: ${name}?`)) return;

    try {
      const res = await fetch(API_DELETE, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await safeJson(res);
      if (!res.ok || !data.success) {
        alert(data.message || "Error al eliminar");
        return;
      }

      const currentId = Number(document.getElementById("clientId")?.value ?? 0);
      if (currentId === Number(id)) cancelEdit();

      await loadClients(state.page);
    } catch (err) {
      console.error("Error en deleteClient:", err);
      alert("Error de conexión");
    }
  }

  function editClient(id) {
    const client = state.byId.get(Number(id));
    if (!client) {
      alert("No se encontró el cliente (vuelve a Consultar).");
      return;
    }

    document.getElementById("clientId").value = String(client.id);
    document.getElementById("nombres").value = client.nombres ?? "";
    document.getElementById("apellido_paterno").value =
      client.apellido_paterno ?? "";
    document.getElementById("apellido_materno").value =
      client.apellido_materno ?? "";
    document.getElementById("domicilio").value = client.domicilio ?? "";
    document.getElementById("email").value = client.email ?? "";

    setFormMode("edit");
    clearClientMessage();
    document.getElementById("nombres")?.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    const form = document.getElementById("clientForm");
    if (form) {
      form.reset();
      form.classList.remove("was-validated");
    }
    const idEl = document.getElementById("clientId");
    if (idEl) idEl.value = "";
    clearClientMessage();
    setFormMode("create");
  }

  async function loadClients(page = state.page) {
    const tableBody = document.getElementById("tableBody");
    const clientsCount = document.getElementById("clientsCount");
    const search = (document.getElementById("searchInput")?.value ?? "").trim();

    if (!tableBody) return;

    if (search !== state.lastSearch) {
      state.lastSearch = search;
      page = 1;
    }

    state.page = page;

    tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">Cargando...</td></tr>`;

    try {
      const url =
        `${API_INDEX}` +
        `&page=${encodeURIComponent(state.page)}` +
        `&limit=${encodeURIComponent(state.limit)}` +
        `&search=${encodeURIComponent(search)}`;

      const res = await fetch(url, { method: "GET", credentials: "include" });
      const data = await safeJson(res);

      if (!res.ok || !data.success) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-danger">${escapeHtml(
          data.message || "Error al consultar",
        )}</td></tr>`;
        state.totalPages = 1;
        renderPagination();
        return;
      }

      const rows = Array.isArray(data.data) ? data.data : [];
      state.byId = new Map(rows.map((r) => [Number(r.id), r]));

      state.totalPages = Number(data.pagination?.total_pages ?? 1);

      if (clientsCount)
        clientsCount.textContent = `${Number(data.pagination?.total ?? rows.length)} clientes`;

      if (rows.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">Sin registros.</td></tr>`;
        renderPagination();
        return;
      }

      tableBody.innerHTML = rows
        .map(
          (c) => `
          <tr>
            <td class="ps-3 fw-medium">${escapeHtml(c.nombres)}</td>
            <td>${escapeHtml(c.apellido_paterno)} ${escapeHtml(c.apellido_materno)}</td>
            <td>${escapeHtml(c.email)}</td>
            <td>${escapeHtml(c.domicilio)}</td>
            <td class="text-end pe-3">
              <div class="btn-group btn-group-sm">
                <button type="button" class="btn btn-outline-warning" onclick="editClient(${Number(c.id)})">Editar</button>
                <button type="button" class="btn btn-outline-danger" onclick="deleteClient(${Number(c.id)})">Eliminar</button>
              </div>
            </td>
          </tr>
        `,
        )
        .join("");

      renderPagination();
    } catch (e) {
      console.error("loadClients error:", e);
      tableBody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-danger">Error de conexión</td></tr>`;
      state.totalPages = 1;
      renderPagination();
    }
  }

  async function safeJson(res) {
    const raw = await res.text();
    try {
      return JSON.parse(raw);
    } catch {
      console.error("Respuesta NO JSON:", raw);
      return { success: false, message: "El servidor no devolvió JSON." };
    }
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function cleanForm() {
    cancelEdit();
  }

  function renderPagination() {
    const paginationEl = document.getElementById("pagination");
    if (!paginationEl) return;

    const p = Number(state.page || 1);
    const tp = Number(state.totalPages || 1);

    if (tp <= 1) {
      paginationEl.innerHTML = "";
      return;
    }

    const mkBtn = (label, page, disabled, active = false) => `
      <li class="page-item ${disabled ? "disabled" : ""} ${active ? "active" : ""}">
        <button class="page-link" type="button" onclick="window.loadClients(${page})">${label}</button>
      </li>
    `;

    const prevDisabled = p <= 1;
    const nextDisabled = p >= tp;

    const start = Math.max(1, p - 2);
    const end = Math.min(tp, start + 4);

    let html = "";
    html += mkBtn("«", p - 1, prevDisabled);

    if (start > 1) {
      html += mkBtn("1", 1, false, p === 1);
      if (start > 2)
        html += `<li class="page-item disabled"><span class="page-link">…</span></li>`;
    }

    for (let i = start; i <= end; i++) {
      html += mkBtn(String(i), i, false, i === p);
    }

    if (end < tp) {
      if (end < tp - 1)
        html += `<li class="page-item disabled"><span class="page-link">…</span></li>`;
      html += mkBtn(String(tp), tp, false, p === tp);
    }

    html += mkBtn("»", p + 1, nextDisabled);
    paginationEl.innerHTML = html;
  }

   async function logout() {
    if (!confirm("¿Deseas cerrar sesión?")) return;

    try {
      const res = await fetch("/api.php?controller=auth&action=logout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await safeJson(res);

      if (!res.ok || !data.success) {
        alert(data.message || "No se pudo cerrar sesión");
        return;
      }

      if (typeof window.loadView === "function") {
        window.loadView("login");
      } else {
        window.location.href = "/login";
      }
    } catch (e) {
      console.error("logout error:", e);
      alert("Error de conexión al cerrar sesión");
    }
  }

  window.createClient = createClient;
  window.updateClient = updateClient;
  window.editClient = editClient;
  window.deleteClient = deleteClient;
  window.cancelEdit = cancelEdit;
  window.cleanForm = cleanForm;
  window.loadClients = loadClients;
  window.logout = logout;

  setFormMode("create");
})();
