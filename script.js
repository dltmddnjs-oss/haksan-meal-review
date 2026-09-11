// ========================================
// 학산급식리뷰
// 급식 API + 별점 + 리뷰
// ========================================


// ========================================
// NEIS API 설정
// ========================================

// ⚠️ 여기 두 곳만 네 정보로 바꾸면 됨!

const NEIS_API_KEY = "2d789f2727b54cec84c5c4f436b8f314";

const ATPT_OFCDC_SC_CODE = "C10";

const SD_SCHUL_CODE = "7150158";


// ========================================
// 리뷰 데이터
// ========================================

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


// ========================================
// HTML 요소 가져오기
// ========================================

const mealDate =
    document.getElementById("mealDate");

const mealDateText =
    document.getElementById("mealDateText");

const lunchList =
    document.getElementById("lunchList");

const dinnerList =
    document.getElementById("dinnerList");

const reviewText =
    document.getElementById("reviewText");

const reviewList =
    document.getElementById("reviewList");

const starButtons =
    document.querySelectorAll(".star-btn");


// ========================================
// 날짜
// ========================================

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


// 처음 접속했을 때 오늘 날짜
mealDate.value =
    formatDate(today);

mealDateText.textContent =
    `${formatDate(today)} 급식`;


// ========================================
// 급식 불러오기
// ========================================

async function loadMeal() {

    const selectedDate =
        mealDate.value;


    if (!selectedDate) {
        return;
    }


    // 화면 초기화
    lunchList.innerHTML =
        "<li>🍚 불러오는 중...</li>";

    dinnerList.innerHTML =
        "<li>🌙 불러오는 중...</li>";


    mealDateText.textContent =
        `${selectedDate} 급식`;


    // YYYY-MM-DD → YYYYMMDD
    const apiDate =
        selectedDate.replaceAll("-", "");


    // NEIS API 주소
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


        // ========================================
        // API 오류
        // ========================================

        if (data.RESULT) {

            showMealError(
                data.RESULT.MESSAGE
            );

            return;
        }


        // ========================================
        // 급식 데이터 확인
        // ========================================

        if (
            !data.mealServiceDietInfo ||
            !data.mealServiceDietInfo[1] ||
            !data.mealServiceDietInfo[1].row
        ) {

            showNoMeal();

            return;
        }


        const meals =
            data.mealServiceDietInfo[1].row;


        // ========================================
        // 중식 / 석식 분리
        // ========================================

        const lunchMeals =
            meals.filter(function(meal) {

                return meal.MMEAL_SC_CODE === "2";

            });


        const dinnerMeals =
            meals.filter(function(meal) {

                return meal.MMEAL_SC_CODE === "3";

            });


        // ========================================
        // 중식 표시
        // ========================================

        if (lunchMeals.length > 0) {

            lunchList.innerHTML = "";

            lunchMeals.forEach(function(meal) {

                addMenus(
                    lunchList,
                    meal.DDISH_NM
                );

            });

        } else {

            lunchList.innerHTML =
                "<li>🥺 중식 정보가 없어요.</li>";

        }


        // ========================================
        // 석식 표시
        // ========================================

        if (dinnerMeals.length > 0) {

            dinnerList.innerHTML = "";

            dinnerMeals.forEach(function(meal) {

                addMenus(
                    dinnerList,
                    meal.DDISH_NM
                );

            });

        } else {

            dinnerList.innerHTML =
                "<li>🥺 석식 정보가 없어요.</li>";

        }


    } catch (error) {

        console.error(error);

        showMealError(
            "급식 정보를 불러오지 못했어요."
        );

    }

}


// ========================================
// 메뉴 표시
// ========================================

function addMenus(list, menuText) {

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


        list.appendChild(li);

    });

}


// ========================================
// 급식 없음
// ========================================

function showNoMeal() {

    lunchList.innerHTML =
        "<li>🥺 이 날짜에는 급식 정보가 없어요.</li>";

    dinnerList.innerHTML =
        "<li>🥺 이 날짜에는 급식 정보가 없어요.</li>";

}


// ========================================
// API 오류 표시
// ========================================

function showMealError(message) {

    lunchList.innerHTML =
        `<li>😥 ${message}</li>`;

    dinnerList.innerHTML =
        `<li>😥 ${message}</li>`;

}


// ========================================
// 급식 보기 버튼
// ========================================

document
    .getElementById("searchBtn")
    .addEventListener(
        "click",
        function() {

            loadMeal();

        }
    );


// ========================================
// 이전 날짜
// ========================================

document
    .getElementById("prevDay")
    .addEventListener(
        "click",
        function() {

            const date =
                new Date(mealDate.value);


            date.setDate(
                date.getDate() - 1
            );


            mealDate.value =
                formatDate(date);


            loadMeal();

        }
    );


// ========================================
// 다음 날짜
// ========================================

document
    .getElementById("nextDay")
    .addEventListener(
        "click",
        function() {

            const date =
                new Date(mealDate.value);


            date.setDate(
                date.getDate() + 1
            );


            mealDate.value =
                formatDate(date);


            loadMeal();

        }
    );


// ========================================
// 날짜 직접 선택
// ========================================

mealDate.addEventListener(
    "change",
    function() {

        loadMeal();

    }
);


// ========================================
// 별점 선택
// ========================================

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


// ========================================
// 리뷰 등록
// ========================================

document
    .getElementById("submitReview")
    .addEventListener(
        "click",
        function() {

            const text =
                reviewText.value.trim();


            // 별점 확인
            if (selectedRating === 0) {

                alert(
                    "별점을 먼저 선택해주세요! ⭐"
                );

                return;
            }


            // 리뷰 내용 확인
            if (text === "") {

                alert(
                    "리뷰 내용을 입력해주세요! 💬"
                );

                return;
            }


            // 리뷰 추가
            const newReview = {

                rating:
                    selectedRating,

                text:
                    text

            };


            reviews.unshift(
                newReview
            );


            // 초기화
            reviewText.value = "";

            selectedRating = 0;

            updateStarButtons();

            displayReviews();

            updateAverageRating();

        }
    );


// ========================================
// 리뷰 표시
// ========================================

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


        item.innerHTML =
            `
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


// ========================================
// 평균 별점
// ========================================

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


// ========================================
// 처음 실행
// ========================================

displayReviews();

updateAverageRating();

loadMeal();
