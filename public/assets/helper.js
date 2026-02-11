const loadView = (viewName) => {
  fetch(`views/${viewName}.html`)
    .then((res) => res.text())
    .then((html) => {
      document.getElementById("app").innerHTML = html;
    });
};
