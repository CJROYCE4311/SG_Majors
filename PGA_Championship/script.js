document.querySelectorAll('.nav-btn').forEach((button) => {
    button.addEventListener('click', () => {
        const targetId = button.getAttribute('data-tab');

        document.querySelectorAll('.nav-btn').forEach((navButton) => {
            navButton.classList.remove('active');
        });

        document.querySelectorAll('.view-section').forEach((section) => {
            section.classList.remove('active');
        });

        button.classList.add('active');
        document.getElementById(targetId).classList.add('active');
    });
});
