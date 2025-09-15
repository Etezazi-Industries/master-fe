import { openBoeingFinishModal } from "../components/BoeingFinishModal.js";

// Wait for DOM to be ready
document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("btn-boeing-finish");
    if (button) {
        button.addEventListener("click", openBoeingFinishModal);
    }
});
