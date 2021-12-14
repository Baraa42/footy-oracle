<template>
  <div>
    <div class="relative flex lg:flex-row flex-col items-center justify-between w-full animate-pulse">
      <div class="flex lg:flex-row flex-row-reverse justify-between lg:justify-start lg:items-center lg:space-x-4 w-full">
        <div class="bg-gray-200 h-12 w-20 rounded"></div>
        <div class="flex flex-col justify-center items-start space-y-3">
          <div class="flex flex-row space-x-2 items-center">
            <div class="bg-gray-200 h-4 w-4"></div>
            <div class="bg-gray-200 h-4 w-24"></div>
          </div>
          <div>
            <div class="bg-gray-200 h-4 w-48"></div>
          </div>
        </div>
      </div>

      <div class="flex lg:flex-row flex-col lg:space-x-3 lg:space-y-0 space-y-2 mt-6 lg:mt-0 w-full lg:w-auto lg:absolute lg:right-0">
        <div class="flex flex-row justify-between items-center lg:bg-gray-50 lg:pl-1">
          <div class="lg:hidden bg-gray-200 w-24 h-4"></div>
          <div class="flex flex-row">
            <div class="bg-blue-100 h-12 w-20 rounded-l"></div>
            <div class="bg-red-100 h-12 w-20 rounded-r"></div>
          </div>
        </div>
        <div class="flex flex-row justify-between items-center">
          <div class="lg:hidden bg-gray-200 w-12 h-4"></div>
          <div class="flex flex-row">
            <div class="bg-blue-100 h-12 w-20 rounded-l"></div>
            <div class="bg-red-100 h-12 w-20 rounded-r"></div>
          </div>
        </div>
        <div class="flex flex-row justify-between items-center">
          <div class="lg:hidden bg-gray-200 w-24 h-4"></div>
          <div class="flex flex-row">
            <div class="bg-blue-100 h-12 w-20 rounded-lm"></div>
            <div class="bg-red-100 h-12 w-20 rounded-r"></div>
          </div>
        </div>
      </div>
    </div>
    <hr class="lg:hidden mt-4" />
  </div>
</template>
