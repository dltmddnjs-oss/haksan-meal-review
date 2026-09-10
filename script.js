// ================================
// 학산급식리뷰 - 기본 기능
// ================================

// 현재 선택된 별점
let selectedRating = 0;

// 테스트용 리뷰 데이터
let reviews = [
    {
        rating: 5,
        text: "오늘 급식 정말 맛있었어요! 🍚💕"
    },
    {
        rating: 4,
        text: "전체적으로 맛있었는데 조금 아쉬웠어요!"
    }
];


// ================================
// 날짜 설정
// ================================

const mealDate = document.getElementById("mealDate");
const mealDateText = document.getElementById("mealDateText");

const today = new Date();

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// 처음 사이트에 들어왔을 때 오늘 날짜 표시
mealDate.value = formatDate(today);
mealDateText.textContent = `${formatDate(today)} 급식`;


// ================================
// 급식 불러오기
// ================================

const mealList = document.getElementById("mealList");

function showTestMeal() {

    mealList.innerHTML = "";

    const testMeals = [
        "🍚 쌀밥",
        "🍲 김치찌개",
        "🍗 닭갈비",
        "🥗 야채샐러드",
        "🥬 배추김치",
        "🍓 후식"
    ];

    testMeals.forEach(function(meal) {

        const li = document.createElement("li");

        li.textContent = meal;

        mealList.appendChild(li);

    });

    mealDateText.textContent =
        `${mealDate.value} 급식`;
}


// 급식 보기 버튼
document.getElementById("searchBtn").addEventListener("click", function() {

    showTestMeal();

});


// ================================
// 날짜 이동
// ================================

document.getElementById("prevDay").addEventListener("click", function() {

    const date = new Date(mealDate.value);

    date.setDate(date.getDate() - 1);

    mealDate.value = formatDate(date);

    showTestMeal();

});


document.getElementById("nextDay").addEventListener("click", function() {

    const date = new Date(mealDate.value);

    date.setDate(date.getDate() + 1);

    mealDate.value = formatDate(date);

    showTestMeal();

});


// ================================
// 별점 선택
// ================================

const starButtons =
    document.querySelectorAll(".star-btn");


starButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        selectedRating =
            Number(button.dataset.rating);

        updateStarButtons();

    });

});


function updateStarButtons() {

    starButtons.forEach(function(button) {

        const rating =
            Number(button.dataset.rating);

        if (rating <= selectedRating) {

            button.textContent = "★";

        } else {

            button.textContent = "☆";

        }

    });

}


// ================================
// 리뷰 등록
// ================================

const reviewText =
    document.getElementById("reviewText");

const reviewList =
    document.getElementById("reviewList");


document.getElementById("submitReview")
    .addEventListener("click", function() {

        const text =
            reviewText.value.trim();


        if (selectedRating === 0) {

            alert("별점을 먼저 선택해주세요! ⭐");

            return;

        }


        if (text === "") {

            alert("리뷰 내용을 입력해주세요! 💬");

            return;

        }


        const newReview = {

            rating: selectedRating,

            text: text

        };


        reviews.unshift(newReview);


        reviewText.value = "";

        selectedRating = 0;

        updateStarButtons();

        displayReviews();

        updateAverageRating();

    });


// ================================
// 리뷰 화면에 표시
// ================================

function displayReviews() {

    reviewList.innerHTML = "";


    if (reviews.length === 0) {

        reviewList.innerHTML =
            '<p class="empty-message">아직 작성된 리뷰가 없어요 🥺</p>';

        return;

    }


    reviews.forEach(function(review) {

        const item =
            document.createElement("div");

        item.className = "review-item";


        const stars =
            "★".repeat(review.rating) +
            "☆".repeat(5 - review.rating);


        item.innerHTML = `
            <div class="review-stars">${stars}</div>
            <p>${review.text}</p>
        `;


        reviewList.appendChild(item);

    });

}


// ================================
// 평균 별점 계산
// ================================

function updateAverageRating() {

    const averageRating =
        document.getElementById("averageRating");

    const averageStars =
        document.getElementById("averageStars");

    const reviewCount =
        document.getElementById("reviewCount");


    if (reviews.length === 0) {

        averageRating.textContent = "0.0";

        averageStars.textContent = "☆☆☆☆☆";

        reviewCount.textContent = "0";

        return;

    }


    let total = 0;


    reviews.forEach(function(review) {

        total += review.rating;

    });


    const average =
        total / reviews.length;


    averageRating.textContent =
        average.toFixed(1);


    const rounded =
        Math.round(average);


    averageStars.textContent =
        "★".repeat(rounded) +
        "☆".repeat(5 - rounded);


    reviewCount.textContent =
        reviews.length;

}


// ================================
// 처음 화면 표시
// ================================

showTestMeal();

displayReviews();

updateAverageRating();
