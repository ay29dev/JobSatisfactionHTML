document.addEventListener("DOMContentLoaded", () => {
  const apiUrl = "https://localhost:7199/api/Form/getLookup";
  const lookupEndpoints = {
    officeId: "officeLookups",
    classId: "classLookups",
    eduId: "eduLookups",
    serviceId: "serviceLookups",
    envId: "envLookups",
  };

  async function populateDropdown(selectId, lookupKey, idField = "id", valueField = "value") {
    const selectElement = document.getElementById(selectId);

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error("Failed to fetch lookup data");

      const data = await response.json();
      const lookupData = data[lookupKey];

      selectElement.innerHTML = '<option value="" disabled selected>اختيار عنصر</option>';
      lookupData.forEach((item) => {
        const option = document.createElement("option");
        option.value = item[idField];
        option.textContent = item[valueField] || item.name;
        selectElement.appendChild(option);
      });
    } catch (error) {
      console.error(`Error populating ${selectId}:`, error);
    }
  }

  Object.entries(lookupEndpoints).forEach(([selectId, lookupKey]) => {
    const idField = selectId === "officeId" ? "id" : "id";
    const valueField = selectId === "officeId" ? "name" : "value";
    populateDropdown(selectId, lookupKey, idField, valueField);
  });

  const form = document.getElementById("dataForm");
  const resultsTable = document.getElementById("resultsTable").querySelector("tbody");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const results = [];

    resultsTable.querySelectorAll("tr").forEach((row) => {
      const form2Id = row.querySelector('input[name="form2Id"]').value;
      const optionResult = row.querySelector('input[name="optionResult"]').value;
      const features = row.querySelector('input[name="features"]').value;

      results.push({ form2Id: parseInt(form2Id), optionResult, features });
    });

    const data = {
      Officeid: parseInt(formData.get("Officeid")),
      OfficeType: parseInt(formData.get("OfficeType")),
      JobDeg: parseInt(formData.get("JobDeg")),
      ClassId: parseInt(formData.get("ClassId")),
      Notes: formData.get("Notes"),
      Gender: formData.get("Gender"),
      EduId: parseInt(formData.get("EduId")),
      ServiceId: parseInt(formData.get("ServiceId")),
      EnvId: parseInt(formData.get("EnvId")),
      results,
    };

    try {
      const response = await fetch("https://localhost:7199/api/Form/createForm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert("Data submitted successfully!");
      } else {
        alert("Failed to submit data.");
      }
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  });

  async function populateResultsTable() {
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error("Failed to fetch data");
      const data = await response.json();

      if (data.form2Lookups) {
        data.form2Lookups.forEach((lookup) => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${lookup.axis} - ${lookup.details}</td>
            <td><input type="hidden" name="form2Id" value="${lookup.id}">${lookup.id}</td>
            <td><input type="text" class="form-control" name="optionResult" required></td>
            <td><input type="text" class="form-control" name="features" required></td>
          `;
          resultsTable.appendChild(row);
        });
      }
    } catch (error) {
      console.error("Error populating results table:", error);
    }
  }

  populateResultsTable();
});
