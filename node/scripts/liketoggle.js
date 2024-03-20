const likeButtons = document.querySelectorAll("#likeButton");
likeButtons.forEach((likeButton) => {
  likeButton.addEventListener("click", function () {
    const like = likeButton.previousElementSibling.previousElementSibling;
    const count = parseInt(
      likeButton.previousElementSibling.previousElementSibling.textContent.match(/\d+/)[0]
    );
    if (likeButton.innerText === "スキ！") {
      likeButton.innerText = "スキ済";
      like.innerText = `スキ⭐️${count + 1}`;
    } else {
      likeButton.innerText = "スキ！";
      like.innerText = `スキ⭐️${count - 1}`;
    }
    const wordId = likeButton.dataset.wordid;
    fetch(`/${wordId}/like/toggle`, {
      method: "POST",
    });
  });
});
