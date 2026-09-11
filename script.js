// ================================
// 학산급식리뷰
// NEIS 급식 API + 리뷰 기능
// ================================


// ================================
// NEIS API 설정
// ================================

// ★ 네가 발급받은 API 인증키 입력
const NEIS_API_KEY = "2d789f2727b54cec84c5c4f436b8f314";

// 부산광역시교육청
const ATPT_OFCDC_SC_CODE = "C10";

// ★ 학산여고의 행정표준코드 입력
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
// 날짜 설정
// ================================

const mealDate =
    document.getElementById("mealDate");

const mealDateText =
    document.getElementById("mealDateText");

const mealList =
    document.getElementById("mealList");

const today = new Date();


function formatDate(date) {

    const year =
        date.getFullYear();

    const month =
        String(date.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(date.getDate())
            .padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// 처음 사이트에 들어왔을 때 오늘 날짜
mealDate.value =
    formatDate(today);

mealDateText.textContent =
    `${formatDate(today)} 급식`;


// ================================
// NEIS 급식 API
// ================================

async function loadMeal() {

    const selectedDate =
        mealDate.value;

    if (!selectedDate) {
        return;
    }


    // YYYY-MM-DD → YYYYMMDD
    const apiDate =
        selectedDate.replaceAll("-", "");


    mealList.innerHTML = `
        <li>🍚 급식 정보를 불러오는 중이에요...</li>
    `;


    mealDateText.textContent =
        `${selectedDate} 급식`;


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

        const response =
            await fetch(url);


        if (!response.ok) {
            throw new Error("API 요청 실패");
        }


        const data =
            await response.json();


        // ================================
        // API 오류 확인
        // ================================

        if (data.RESULT) {

            mealList.innerHTML = `
                <li>
                    😥 급식 정보를 불러오지 못했어요.
                    <br><br>
                    ${data.RESULT.MESSAGE}
                </li>
            `;

            return;
        }


        // ================================
        // 급식 데이터 확인
        // ================================

        if (
            !data.mealServiceDietInfo ||
            !data.mealServiceDietInfo[1] ||
            !data.mealServiceDietInfo[1].row
        ) {

            mealList.innerHTML = `
                <li>
                    🥺 이 날짜에는 등록된 급식 정보가 없어요.
                </li>
            `;

            return;
        }


        const meals =
            data.mealServiceDietInfo[1].row;


        mealList.innerHTML = "";


        // ================================
        // 중식 / 석식 구분
        // ================================

        const lunchMeals =
            meals.filter(function(meal) {

                return meal.MMEAL_SC_CODE === "2";

            });


        const dinnerMeals =
            meals.filter(function(meal) {

                return meal.MMEAL_SC_CODE === "3";

            });


        // ================================
        // 중식 표시
        // ================================

        if (lunchMeals.length > 0) {

            createMealTitle("🍚 중식");

            lunchMeals.forEach(function(meal) {

                showMealMenu(meal);

            });

        }


        // ================================
        // 석식 표시
        // ================================

        if (dinnerMeals.length > 0) {

            createMealTitle("🌙 석식");

            dinnerMeals.forEach(function(meal) {

                showMealMenu(meal);

            });

        }


        // ================================
        // 중식/석식 모두 없는 경우
        // ================================

        if (
            lunchMeals.length === 0 &&
            dinnerMeals.length === 0
        ) {

            mealList.innerHTML = `
                <li>
                    🥺 표시할 급식 정보가 없어요.
                </li>
            `;

        }


    } catch (error) {

        console.error(error);

        mealList.innerHTML = `
            <li>
                😥 급식 정보를 불러오지 못했어요.
                <br><br>
                API 키와 학교 코드를 확인해주세요.
            </li>
        `;

    }

}


// ================================
// 급식 구분 제목 만들기
// ================================

function createMealTitle(title) {

    const titleLi =
        document.createElement("li");

    titleLi.className =
        "meal-type-title";

    titleLi.textContent =
        title;

    mealList.appendChild(titleLi);

}


// ================================
// 급식 메뉴 표시
// ================================

function showMealMenu(meal) {

    const menuText =
        meal.DDISH_NM;


    // <br/>로 메뉴 분리
    const menus =
        menuText
            .split("<br/>")
            .map(function(menu) {

                return menu.trim();

            })
            .filter(function(menu) {

                return menu !== "";

            });


    menus.forEach(function(menu) {

        // 알레르기 번호 제거
        const cleanMenu =
            menu.replace(/\([0-9.]+\)/g, "");


        const li =
            document.createElement("li");


        li.textContent =
            "🍴 " + cleanMenu;


        mealList.appendChild(li);

    });

}


// ================================
// 급식 보기 버튼
// ================================

document
    .getElementById("searchBtn")
    .addEventListener("click", function() {

        loadMeal();

    });


// ================================
// 이전 날짜
// ================================

document
    .getElementById("prevDay")
    .addEventListener("click", function() {

        const date =
            new Date(mealDate.value);

        date.setDate(
            date.getDate() - 1
        );

        mealDate.value =
            formatDate(date);

        loadMeal();

    });


// ================================
// 다음 날짜
// ================================

document
    .getElementById("nextDay")
    .addEventListener("click", function() {

        const date =
            new Date(mealDate.value);

        date.setDate(
            date.getDate() + 1
        );

        mealDate.value =
            formatDate(date);

        loadMeal();

    });


// ================================
// 날짜 직접 선택
// ================================

mealDate.addEventListener(
    "change",
    function() {

        loadMeal();

    }
);


// ================================
// 별점 선택
// ================================

const starButtons =
    document.querySelectorAll(".star-btn");


starButtons.forEach(function(button) {

    button.addEventListener(
        "click",
        function() {

            selectedRating =
                Number(
                    button.dataset.rating
                );

            updateStarButtons();

        }
    );

});


function updateStarButtons() {

    starButtons.forEach(function(button) {

        const rating =
            Number(
                button.dataset.rating
            );


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


document
    .getElementById("submitReview")
    .addEventListener(
        "click",
        function() {

            const text =
                reviewText.value.trim();


            if (selectedRating === 0) {

                alert(
                    "별점을 먼저 선택해주세요! ⭐"
                );

                return;
            }


            if (text === "") {

                alert(
                    "리뷰 내용을 입력해주세요! 💬"
                );

                return;
            }


            const newReview = {

                rating:
                    selectedRating,

                text:
                    text

            };


            reviews.unshift(
                newReview
            );


            reviewText.value = "";

            selectedRating = 0;

            updateStarButtons();

            displayReviews();

            updateAverageRating();

        }
    );


// ================================
// 리뷰 표시
// ================================

function displayReviews() {

    reviewList.innerHTML = "";


    if (reviews.length === 0) {

        reviewList.innerHTML =
            `
            <p class="empty-message">
                아직 작성된 리뷰가 없어요 🥺
            </p>
            `;

        return;
    }


    reviews.forEach(function(review) {

        const item =
            document.createElement("div");


        item.className =
            "review-item";


        const stars =
            "★".repeat(review.rating) +
            "☆".repeat(
                5 - review.rating
            );


        item.innerHTML = `
            <div class="review-stars">
                ${stars}
            </div>

            <p>
                ${review.text}
            </p>
        `;


        reviewList.appendChild(item);

    });

}


// ================================
// 평균 별점
// ================================

function updateAverageRating() {

    const averageRating =
        document.getElementById(
            "averageRating"
        );

    const averageStars =
        document.getElementById(
            "averageStars"
        );

    const reviewCount =
        document.getElementById(
            "reviewCount"
        );


    if (reviews.length === 0) {

        averageRating.textContent =
            "0.0";

        averageStars.textContent =
            "☆☆☆☆☆";

        reviewCount.textContent =
            "0";

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
        "☆".repeat(
            5 - rounded
        );


    reviewCount.textContent =
        reviews.length;

}


// ================================
// 처음 화면
// ================================

displayReviews();

updateAverageRating();

loadMeal();
