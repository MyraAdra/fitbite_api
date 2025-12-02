//const API = "http://localhost:3000";
const API = "https://fitbite-api-idi9.onrender.com";
const modal = new bootstrap.Modal(document.getElementById('adminModal'));

document.addEventListener("DOMContentLoaded", () => {
    loadFeatures();
    loadServices();
    loadTestimonials();
});

function loadFeatures() {
    fetch(`${API}/features`)
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById("featuresTable");
            tbody.innerHTML = "";
            data.forEach(item => {
                tbody.innerHTML += `
                    <tr>
                      <td><i class="${item.icon}"></i></td>
                      <td>${item.title}</td>
                      <td>${item.description}</td>
                      <td>
                        <button class="btn btn-warning btn-sm"
        onclick='openModal("feature", ${JSON.stringify(item).replace(/'/g, "&apos;")})'>Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteFeature('${item._id}')">Delete</button>
                      </td>
                    </tr>`;
            });
        });
}

function deleteFeature(id) {
    if (!confirm("Delete this feature?")) return;
    fetch(`${API}/features/${id}`, { method: "DELETE" })
        .then(() => loadFeatures());
}

// SERVICES
function loadServices() {
    fetch(`${API}/services`)
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById("servicesTable");
            tbody.innerHTML = "";
            data.forEach(item => {
                tbody.innerHTML += `
                    <tr>
                      <td><i class="${item.icon}"></i></td>
                      <td>${item.title}</td>
                      <td>${item.description}</td>
                      <td>
                        <button class="btn btn-warning btn-sm"
        onclick='openModal("service", ${JSON.stringify(item).replace(/'/g, "&apos;")})'>Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteService('${item._id}')">Delete</button>
                      </td>
                    </tr>`;
            });
        });
}

function deleteService(id) {
    fetch(`${API}/services/${id}`, { method: "DELETE" })
        .then(() => loadServices());
}

// TESTIMONIALS
function loadTestimonials() {
    fetch(`${API}/testimonials`)
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById("testimonialsTable");
            tbody.innerHTML = "";
            data.forEach(item => {
                tbody.innerHTML += `
                    <tr>
                      <td>${item.name}</td>
                      <td>${item.city}</td>
                      <td>${item.stars} ⭐</td>
                      <td>${item.review}</td>
                      <td>
                        <button class="btn btn-warning btn-sm"
        onclick='openModal("testimonial", ${JSON.stringify(item).replace(/'/g, "&apos;")})'>Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteTestimonial('${item._id}')">Delete</button>
                      </td>
                    </tr>`;
            });
        });
}

function deleteTestimonial(id) {
    fetch(`${API}/testimonials/${id}`, { method: "DELETE" })
        .then(() => loadTestimonials());
}


/* Load Portfolio into admin delete list */
function loadPortfolioList() {
  fetch(`${API}/portfolio`)
    .then(res => res.json())
    .then(items => {
      const container = document.getElementById("portfolioList");
      container.innerHTML = "";

      items.forEach(item => {
        const col = document.createElement("div");
        col.className = "col-md-3 mb-3";

        col.innerHTML = `
          <div class="card h-100 shadow-sm">
            <img src="${API}${item.imageUrl}" class="card-img-top" style="height:150px; object-fit:cover;">
            <div class="card-body p-2">
              <p class="card-text small">${item.title}</p>
              <button class="btn btn-sm btn-outline-danger w-100"
                onclick="deletePortfolio('${item._id}')">Delete</button>
            </div>
          </div>
        `;

        container.appendChild(col);
      });
    })
    .catch(err => console.error(err));
}

/* Upload New Image */
document.getElementById("uploadForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("portfolioTitle").value;
  const file = document.getElementById("portfolioImage").files[0];

  const formData = new FormData();
  formData.append("title", title);
  formData.append("image", file);

  await fetch(`${API}/portfolio`, {
    method: "POST",
    body: formData
  });

  document.getElementById("uploadForm").reset();
  loadPortfolioList(); // Refresh delete list
});

/* Delete Item */
function deletePortfolio(id) {
  fetch(`${API}/portfolio/${id}`, { method: "DELETE" })
    .then(() => loadPortfolioList())
    .catch(err => console.error(err));
}


document.getElementById("portfolio-tab").addEventListener("click", loadPortfolioList);

//OPEN MODAL
function openModal(type, item = null) {
    document.getElementById('modalType').value = type;

    // Reset form
    document.getElementById('modalForm').reset();
    document.getElementById('modalId').value = "";

    // Show or hide testimonial fields
    document.getElementById('cityBox').style.display = (type === "testimonial") ? "block" : "none";
    document.getElementById('starsBox').style.display = (type === "testimonial") ? "block" : "none";

    if (item) {
        document.getElementById('modalId').value = item._id;
        document.getElementById('modalIcon').value = item.icon;
        document.getElementById('modalTitleInput').value = item.title || item.name;
        document.getElementById('modalDescription').value = item.description || item.review;
        document.getElementById('modalCity').value = item.city || "";
        document.getElementById('modalStars').value = item.stars || "";
        document.getElementById('modalTitle').innerText = "Edit " + type;
    } else {
        document.getElementById('modalTitle').innerText = "Add " + type;
    }

    modal.show();
}



document.getElementById('modalForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const id = document.getElementById('modalId').value;
    const type = document.getElementById('modalType').value;
    const icon = document.getElementById('modalIcon').value;
    const title = document.getElementById('modalTitleInput').value;
    const description = document.getElementById('modalDescription').value;
    const city = document.getElementById('modalCity').value;
    const stars = document.getElementById('modalStars').value;

    let data;
    let url = `${API}/${type}s`;
    let method = id ? "PUT" : "POST";

    if (id) url += `/${id}`;

    if (type === "testimonial") {
        data = { name: title, city, stars: Number(stars), review: description };
    } else {
        data = { icon, title, description };
    }

    fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(() => {
        modal.hide();
        type === "feature" && loadFeatures();
        type === "service" && loadServices();
        type === "testimonial" && loadTestimonials();
    });
});
