<template>
  <div class="app pay-success-page"> <!-- Base class 'app' for overall structure -->
    <div class="divHead"> <!-- Header styling based on homepage, but simplified -->
      <div class="divTitle">
        <van-icon name="arrow-left" @click="toMainPage" class="back-icon"/>
        <span>支付成功</span>
        <img src="@/assets/images/home.png" @click="toMainPage" class="home-icon"/>
      </div>
    </div>
    <div class="divContent"> <!-- Specific content area for this page -->
      <img src="@/assets/images/success.png" alt="支付成功" class="success-icon-img"/>
      <div class="divSuccess">下单成功</div>
      <div class="divDesc">预计 {{ finishTime }} 送达</div>
      <div class="divDesc1">后厨正在加紧制作中，请耐心等待~</div>
      <!-- "查看订单" Button, styled like primary action button -->
      <van-button
        type="primary"
        class="btnView"
        @click="toOrderPage"
        round
        :color="'#4CAF50'" 
      >
        查看订单
      </van-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
// Assuming Vant Icon and Button are globally registered or automatically imported

const router = useRouter();
const finishTime = ref('');

const calculateFinishTime = () => {
  let now = new Date();
  let deliveryHour = now.getHours() + 1;
  let deliveryMinute = now.getMinutes();

  if (deliveryHour >= 24) {
    deliveryHour -= 24;
  }

  const hourStr = String(deliveryHour).padStart(2, '0');
  const minuteStr = String(deliveryMinute).padStart(2, '0');

  finishTime.value = `${hourStr}:${minuteStr}`;
};

const toOrderPage = () => {
  router.replace('/order');
};

const toMainPage = () => {
  router.replace('/');
};

onMounted(() => {
  calculateFinishTime();
});

</script>

<style scoped>
/* --- Base from homepage .app --- */
.app {
height: 100vh;
display: flex;
flex-direction: column;
background-color: #f8fbf6; /* Homepage light green background */
overflow: hidden;
}

/* --- Header Adaptation --- */
/* Use a simpler header than homepage's gradient/overlap */
.app .divHead {
background: #ffffff; /* Simple white */
height: 50px; /* Consistent simple header height */
position: sticky; /* Keep header visible */
top: 0;
z-index: 20;
border-bottom: 1px solid #ebedf0; /* Subtle separator */
flex-shrink: 0;
box-sizing: border-box;
}

/* Header Title container */
.app .divHead .divTitle {
/* Resetting homepage's absolute positioning for the card */
position: relative;
width: 100%;
background: none; /* No card background */
border-radius: 0;
box-shadow: none;
top: 0;
left: 0;
right: 0;
z-index: 1;
padding: 0; /* Reset padding */
box-sizing: border-box;

/* Centering text within the header */
text-align: center;
height: 100%;
line-height: 50px; /* Match header height */
font-size: 17px;
font-weight: 500;
color: #333333; /* Dark text */
}

/* Back Icon */
.app .divHead .divTitle .back-icon {
position: absolute;
left: 15px;
top: 50%;
transform: translateY(-50%);
font-size: 20px;
color: #555; /* Consistent icon color */
cursor: pointer;
}

/* Home Icon (adapting homepage avatar positioning) */
.app .divHead .divTitle .home-icon {
position: absolute;
right: 15px;
top: 50%;
transform: translateY(-50%);
width: 22px; /* Adjusted size */
height: 22px;
border-radius: 0; /* No rounding needed */
cursor: pointer;
}

/* --- Content Area Styling --- */
.app .divContent { /* This replaces .app .divBody */
flex-grow: 1; /* Take remaining space */
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
text-align: center;
padding: 20px 30px; /* Padding */
box-sizing: border-box;
overflow-y: auto; /* Allow scroll if content overflows, though unlikely here */
}

/* Success image styling */
.app .divContent .success-icon-img {
width: 85px; /* Adjusted size */
height: 85px;
margin-bottom: 25px; /* Space below */
}

/* "下单成功" text styling */
.app .divContent .divSuccess {
font-size: 20px;
font-weight: 600; /* Use homepage bold weight */
color: #333333; /* Consistent dark text */
line-height: 1.4;
margin-bottom: 10px;
}

/* Descriptive text styling */
.app .divContent .divDesc,
.app .divContent .divDesc1 {
font-size: 14px;
color: #757575; /* Consistent secondary text color */
line-height: 1.6;
}

.app .divContent .divDesc {
  margin-bottom: 6px; /* Space between lines */
}

.app .divContent .divDesc1 {
margin-bottom: 40px; /* More space above button */
}

/* "查看订单" Button Styling (like homepage primary button) */
.app .divContent .btnView.van-button {
width: 180px;
max-width: 80%;
height: 44px; /* Consistent height */
border: none;
border-radius: 22px; /* Consistent rounding */
/* background-color is set by :color prop */
color: #ffffff; /* White text */
font-size: 15px; /* Consistent font size */
font-weight: 500; /* Consistent weight */
letter-spacing: 0.5px;
box-shadow: 0 2px 5px rgba(76, 175, 80, 0.3); /* Subtle green shadow */
transition: background-color 0.2s, box-shadow 0.2s, opacity 0.2s;
}

.app .divContent .btnView.van-button:active {
background-color: #388e3c !important; /* Darker green on press (match homepage) */
box-shadow: 0 1px 3px rgba(76, 175, 80, 0.2);
opacity: 0.9;
}

</style>