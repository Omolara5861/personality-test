const steps = Array.from(document.querySelectorAll("form .step"));
const nextBtn = document.querySelectorAll("form .next-btn");
const prevBtn = document.querySelectorAll("form .previous-btn");
const form = document.querySelector("form");

nextBtn.forEach((button) => {
  button.addEventListener("click", () => {
    changeStep("next");
  });
});
prevBtn.forEach((button) => {
  button.addEventListener("click", () => {
    changeStep("prev");
  });
});

function changeStep(btn) {
  let index = 1;
  const activeForm = document.querySelector(".active-form");
  index = steps.indexOf(activeForm);
  console.log(index);
  steps[index].classList.remove("active-form");
  if (btn === "next") {
    index++;
  } else if (btn === "prev") {
    index--;
  }
  steps[index].classList.add("active-form");
}

function storeDetailsInSession(firstName, lastName, email) {
  const userFirstName = firstName.value.trim();
  const userLastName = lastName.value.trim();
  const userEmail = email.value.trim();

  if (userEmail && userFirstName && userLastName) {
    sessionStorage.setItem("userFirstName", userFirstName);
    sessionStorage.setItem("userLastName", userLastName);
    sessionStorage.setItem("userEmail", userEmail);
    console.log(
      "Details stored in session storage:",
      userEmail,
      userFirstName,
      userLastName
    );
  } else {
    console.error("Details not found or invalid.");
    // Handle error or display message to the user
  }
}
function getEmailFromSessionStorage() {
  const userEmail = sessionStorage.getItem("userEmail");
  return userEmail;
}

function sendVerificationCode(event) {
  // Prevent the default form submission
  event.preventDefault();

  const userFirstNameInput = document.getElementById("userFirstName");
  const userLastNameInput = document.getElementById("userLastName");
  const userEmailInput = document.getElementById("userEmail");
  const submitButton = document.getElementById("submitButton");

  storeDetailsInSession(userFirstNameInput, userLastNameInput, userEmailInput);

  // Validate user input
  const emailPattern = /[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com)/;
  if (!emailPattern.test(userEmailInput.value)) {
    alert("Please provide a valid Gmail or Yahoo address.");
    return;
  }

  // Disable the submit button to prevent multiple submissions
  submitButton.disabled = true;

  // Make a request to the server to send the verification code
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: userEmailInput.value,
    }),
  };

  fetch(
    "https://dca-server-jwcj.onrender.com/sendVerificationCode",
    requestOptions
  )
    .then((response) => {
      if (response.ok) {
        alert("Verification code sent successfully!");
        window.location.href = "verify.html";
      } else {
        alert("Error sending verification code. Please try again.");
        submitButton.disabled = false; // Re-enable button on error
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("An error occurred. Please try again later.");
      submitButton.disabled = false; // Re-enable button on error
    });
}

function resendVerificationCode() {
  // Retrieve user email from session storage
  const userEmail = getEmailFromSessionStorage();

  // Validate user email format
  const emailPattern = /[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com)/;
  if (!emailPattern.test(userEmail)) {
    // alert("Invalid email format. Please provide a valid Gmail or Yahoo address.");
    alert("Verification code sent successfully!");
    window.location.href = "verify-otp.html";
    return;
  }

  // Make a request to the server to resend the verification code
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: userEmail,
    }),
  };

  fetch(
    "https://dca-server-jwcj.onrender.com/resendVerificationCode",
    requestOptions
  )
    .then((response) => {
      if (response.ok) {
        alert("New verification code sent successfully!");
      } else {
        alert("Error resending verification code. Please try again.");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("An error occurred. Please try again later.");
    });
}

function verifyCode() {
  // Retrieve OTP code from input boxes
  const otpInputs = [];
  for (let i = 1; i <= 6; i++) {
    const inputBox = document.getElementById(`inputBox${i}`);

    // Validate input
    if (!inputBox.checkValidity()) {
      alert("Please enter a valid OTP.");
      return;
    }
    otpInputs.push(inputBox.value);
  }

  // Combine OTP values into a single code
  const code = otpInputs.join("");

  const userEmail = getEmailFromSessionStorage();

  // Make a request to the server to verify the code
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: userEmail,
      code: code,
    }),
  };

  console.log("Request Options:", requestOptions);

  // Testing fetch call
  fetch("https://dca-server-jwcj.onrender.com/verifyCode", requestOptions)
    .then((response) => {
      console.log("Fetch response:", response);
      if (response.ok) {
        alert("Verification successful!");
        window.location.href = "questions.html"; // Navigate to questions.html on success
      } else {
        alert(
          "Verification failed. Please make sure the code is correct and try again."
        );
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("An error occurred. Please try again later.");
    });
}

// Function to move focus to the next input box automatically
function moveToNextInput(event, nextIndex) {
  const maxLength = parseInt(event.target.getAttribute("maxlength"), 10);
  const currentLength = event.target.value.length;

  if (currentLength >= maxLength && nextIndex !== null) {
    const nextInput = document.getElementById(`inputBox${nextIndex}`);
    if (nextInput) {
      nextInput.focus();
    }
  }
}

function showResult() {
  // Collect and calculate points for each course
  const courses = [
    "Product Owner",
    "Business Analysis",
    "Scrum Master",
    "Project Management",
    "Data Analysis",
    "Cyber Security",
  ];
  let scores = Array(courses.length).fill(0);

  // Loop through each question and calculate scores
  for (let i = 0; i < courses.length; i++) {
    for (let j = 1; j <= 3; j++) {
      const radioName = `course${i + 1}q${j}`;
      if (!document.querySelector(`input[name="${radioName}"]:checked`)) {
        alert(
          "You have unanswered question(s), please ensure all questions are completed before submitting"
        );
        return; // Exit the function if any question is unanswered
      }
      const selectedValue = parseInt(
        document.querySelector(`input[name="${radioName}"]:checked`).value
      );
      scores[i] += selectedValue;
    }
  }

  // Find the course with the highest score
  const maxScore = Math.max(...scores);
  const winningCourses = courses.filter(
    (course, index) => scores[index] === maxScore
  );

  // Display result
  if (winningCourses.length === 1) {
    const winningCourse = winningCourses[0];
    // Encode the winning course as a query parameter
    const encodedCourse = encodeURIComponent(winningCourse);
    // Redirect to congratulations.html with the winning course appended
    window.location.href = `congratulations.html?course=${encodedCourse}`;
  } else {
    const tiedCourses = winningCourses.join(",");
    window.location.href = `tie.html?courses=${encodeURIComponent(
      tiedCourses
    )}`;
  }
}
