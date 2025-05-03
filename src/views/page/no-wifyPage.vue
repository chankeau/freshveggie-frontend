<template>
    <div class="no-wifi-page">
      <div class="divHead">
        <div class="divTitle">
          <van-icon name="arrow-left" @click="goBack" /> <!-- Using Vant -->
          蔬鲜递
        </div>
      </div>
      <div class="divContent">
        <img src="@/assets/images/no_wifi.png"/> <!-- Updated path -->
        <div class="divDesc">网络连接异常</div>
        <div class="btnRefresh" @click="goBack">点击刷新</div> <!-- Reusing goBack -->
      </div>
    </div>
  </template>
  
  <script setup>

  import { useRouter } from 'vue-router';
  
  const router = useRouter();
  
  const goBack = () => {
    router.back();
  };
  </script>
  
  <style scoped>
 :root {
  --fresh-green: #4CAF50;
  --leaf-green: #8BC34A;
  --button-green-hover: #388E3C;
  --white: #ffffff;
  --page-bg: #f0f2f5;
  --text-dark: #333333;
  --text-medium: #555555;
  --text-light: #888888;
  --warning-orange: #E6A23C; /* Color for warning/error states */
  --warning-bg: #fdf6ec;
}

#no_wifi {
  height: 100%;
  background-color: var(--white); /* Keep white background for this page */
  font-family: "PingFangSC-Regular", sans-serif;
  display: flex;
  flex-direction: column;
}

#no_wifi .divHead {
  width: 100%;
  height: 80rem;
  background: linear-gradient(135deg, var(--fresh-green) 0%, var(--leaf-green) 100%);
  position: relative;
  box-shadow: 0 2px 6px rgba(76, 175, 80, 0.3);
  display: flex;
  align-items: center;
  padding: 0 15rem;
  box-sizing: border-box;
  flex-shrink: 0;
}

#no_wifi .divHead .divTitle {
  flex-grow: 1;
  font-size: 19rem;
  font-weight: 600;
  text-align: center;
  color: var(--white);
  letter-spacing: 0.5px;
  position: static;
  line-height: normal;
  padding-right: 25rem; /* Assuming only back arrow */
}

#no_wifi .divHead .divTitle i { /* Back Arrow */
  position: static;
  transform: none;
  font-size: 24rem;
  color: var(--white);
  cursor: pointer;
  float: left;
}

#no_wifi .divContent {
  flex-grow: 1;
  width: 100%;
  background: var(--white);
  display: flex;
  flex-direction: column;
  text-align: center;
  align-items: center;
  justify-content: center; /* Center content */
  padding: 30rem; /* Add padding */
  box-sizing: border-box;
}

#no_wifi .divContent img.wifi-icon { /* Add class to img tag */
  width: 150rem; /* Adjust size as needed */
  height: auto; /* Maintain aspect ratio */
  margin-bottom: 35rem; /* More space below image */
  opacity: 0.6; /* Make it slightly less prominent */
}

#no_wifi .divContent .divDesc {
  font-size: 18rem; /* Slightly smaller text */
  font-weight: 500;
  color: var(--text-medium);
  line-height: 1.5;
  letter-spacing: 0;
  margin-bottom: 40rem; /* More space before button */
  max-width: 80%; /* Prevent text from being too wide */
}

#no_wifi .divContent .btnRefresh {
  min-width: 140rem; /* Adjust width */
  height: 48rem;
  padding: 0 30rem;
  background: linear-gradient(135deg, var(--leaf-green) 0%, var(--fresh-green) 100%);
  border-radius: 24rem;
  font-size: 16rem;
  font-weight: 500;
  text-align: center;
  color: var(--white);
  line-height: 48rem; /* Match height */
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 3px 8px rgba(76, 175, 80, 0.4);
  border: none;
}

#no_wifi .divContent .btnRefresh:hover {
  background: linear-gradient(135deg, var(--fresh-green) 0%, var(--button-green-hover) 100%);
  box-shadow: 0 5px 12px rgba(76, 175, 80, 0.5);
  transform: translateY(-1px);
}

#no_wifi .divContent .btnRefresh:active {
  transform: scale(0.98);
  box-shadow: 0 2px 5px rgba(76, 175, 80, 0.3);
}
  </style>