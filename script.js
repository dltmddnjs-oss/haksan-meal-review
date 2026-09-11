// ================================
// 학산급식리뷰
// NEIS 급식 API + 리뷰 기능
// ================================

// ★ 여기 두 값만 입력하면 됩니다.
const NEIS_API_KEY = "2d789f2727b54cec84c5c4f436b8f314";
const ATPT_OFCDC_SC_CODE = "C10"; // 부산광역시교육청
const SD_SCHUL_CODE = "7150158";


// ================================
// 리뷰 데이터
// ================================

let selectedRating = 0;

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
// 날짜
// ================================

const mealDate = document.getElementById("mealDate");
const mealDateText = document.getElementById("mealDateText");
const mealList = document.getElementById("mealList");

const today = new Date();

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

mealDate.value = formatDate(today);
mealDateText.textContent = `${formatDate(today)} 급식`;


// ================================
// NEIS 급식 API
// ================================

async function loadMeal() {

    const selectedDate = mealDate.value;

    if (!selectedDate) {
        return;
    }

    const apiDate = selectedDate.replaceAll("-", "");

    mealList.innerHTML = `
        <li>🍚 급식 정보를 불러오는 중이에요...</li>
    `;

    mealDateText.textContent = `${selectedDate} 급식`;

    const url =
        "https://open.neis.go.kr/hub/mealServiceDietInfo" +
        `?KEY=${NEIS_API_KEY}` +
        "&Type=json" +
        "&pIndex=1" +
        "&pSize=100" +
        `&ATPT_OFCDC_SC_CODE=${ATPT_OFCDC_SC_CODE}` +
        `&SD_SCHUL_CODE=${SD_SCHUL_CODE}` +
        `&MLSV_YMD=${apiDate}`;

    try {

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("API 요청 실패");
        }

        const data = await response.json();

        // 급식 정보가 없는 날
        if (
            !data.mealServiceDietInfo ||
            !data.mealServiceDietInfo[1] ||
            !data.mealServiceDietInfo[1].row
        ) {

            mealList.innerHTML = `
                <li>🥺 이 날짜에는 등록된 급식 정보가 없어요.</li>
            `;

            return;
        }

        const meals =
            data.mealServiceDietInfo[1].row;

        mealList.innerHTML = "";

        meals.forEach(function(meal) {

            // DDISH_NM = 메뉴 이름
            const menuText = meal.DDISH_NM;

            // <br/> 기준으로 메뉴 분리
            const menus = menuText
                .split("<br/>")
                .map(menu => menu.trim())
                .filter(menu => menu !== "");

            menus.forEach(function(menu) {

                // 알레르기 번호 제거
                const cleanMenu =
                    menu.replace(/\([0-9.]+\)/g, "");

                const li =
                    document.createElement("li");

                li.textContent = "🍴 " + cleanMenu;

                mealList.appendChild(li);
            });

        });

    } catch (error) {

        console.error(error);

        mealList.innerHTML = `
            <li>
                😥 급식 정보를 불러오지 못했어요.
                <br>
                API 키와 학교 코드를 확인해주세요.
            </li>
        `;
    }
}


// ================================
// 급식 보기
// ================================

document
    .getElementById("searchBtn")
    .addEventListener("click", function() {

        loadMeal();

    });


// ================================
// 날짜 이동
// ================================

document
    .getElementById("prevDay")
    .addEventListener("click", function() {

        const date =
            new Date(mealDate.value);

        date.setDate(date.getDate() - 1);

        mealDate.value =
            formatDate(date);

        loadMeal();

    });


document
    .getElementById("nextDay")
    .addEventListener("click", function() {

        const date =
            new Date(mealDate.value);

        date.setDate(date.getDate() + 1);

        mealDate.value =
            formatDate(date);

        loadMeal();

    });


// ================================
// 날짜 직접 변경
// ================================

mealDate.addEventListener("change", function() {

    loadMeal();

});


// ================================
// 별점
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

        button.textContent =
            rating <= selectedRating
                ? "★"
                : "☆";

    });

}


// ================================
// 리뷰 등록
// ================================

const reviewText =
    document.getElementById("reviewText");

const reviewList =
    document.getElementById("reviewList");


document
    .getElementById("submitReview")
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
// 리뷰 표시
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
            <div class="review-stars">
                ${stars}
            </div>

            <p>${review.text}</p>
        `;

        reviewList.appendChild(item);

    });

}


// ================================
// 평균 별점
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

        averageStars.textContent =
            "☆☆☆☆☆";

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
// 처음 실행
// ================================

displayReviews();

updateAverageRating();

loadMeal();
