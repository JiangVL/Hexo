---
title: 小米平板5pro刷机教程
date: 2025-12-07
description: Xiaomi Pad 5 Pro Flashing Guide
cover: https://cdn.jsdelivr.net/gh/JiangVL/blogimages/img/elish-flashing/Screenshot_2025-12-07-09-11-52-660_com.android.settings.webp
tags:
  - 刷机
  - 教程
categories: 教程
lang: zh-CN
---

#### 解锁Bootloader (BL 锁)
这是刷机的**第一步**，小米设备默认是锁定 Bootloader 的，必须解锁才能刷入非官方系统或 Recovery。
1. **申请解锁权限：** 访问小米官方的 [MIUI 解锁页面](http://www.miui.com/unlock/)，下载解锁工具并按照官方指引申请解锁权限。
    
2. **平板端设置：**
    
    - 在平板的“设置”中找到“关于平板”，连续点击 **“MIUI 版本”** 直到提示“您已处于开发者模式”。
        
    - 返回“设置” > “更多设置” > “开发者选项”。
        
    - 在“开发者选项”中开启 **“OEM 解锁”** 和 **“USB 调试”**。
        
    - 找到 **“设备解锁状态”**，并按照提示将您的小米账号与设备进行绑定（可能需要等待 72 小时甚至更长时间）。
        
3. **使用解锁工具解锁：**
    
    - 将平板关机，然后同时按住 **“音量下” + “电源键”** 进入 Fastboot 模式。
        
    - 将平板通过 USB 连接到电脑。
        
    - 在电脑上运行下载好的解锁工具(miflash_unlock)，登录与平板绑定的同一小米账号。
        
    - 点击 **“解锁”** 按钮，等待解锁完成。
        

> **注意：** 解锁 Bootloader 会清除设备所有数据。  
> 如果您已经升级了澎湃1.0系统就自行去bilibili寻找绕过教程，有很多。
### 3. 刷入 Recovery (如 TWRP或橙狐)

如果需要刷入第三方 ROM 或更方便地进行卡刷操作，通常需要先刷入一个第三方 Recovery（例如 TWRP）。
我习惯使用橙狐[小米平板5 Pro 橙狐设备树（小米Pad 5 Pro）](https://github.com/ymdzq/OFRP-device_xiaomi_elish)  
打开电脑连接设备，进入fastboot模式
进入[Release](https://github.com/ymdzq/OFRP-device_xiaomi_elish/releases)中，点开Assets选项，点击7z压缩包文件名下载  
解压所有文件后，打开解压出的文件夹，运行recovery-twrp一键刷入工具.bat根据提示刷入，如果adb连接设备成功会自动重启进入recovery  
临时启动成功之后，可以通过“菜单”>“更多”>“安装当前OrangeFox”>滑动滑块确认，把橙狐固化进boot分区，替换掉官方recovery，  
也可以通过刷入zip格式的橙狐安装包来完成固化。  
**注意：** 不是所有的boot.img文件都是刷入boot当中，recovery文件也可叫boot.img
### 4.刷机资源寻找
常用的刷机资源在手机应用商店搜索酷安下载，搜索**小米平板5pro**专区里头基本上都能找到。  
想要刷入类原生系统还可以前往XDA论坛，浏览器搜索进去，当然你也可以去github的设备树上自己寻找所在设备，比较麻烦。  
还有可以前往柚坛社区等地寻找
### 5. 刷入系统

根据您想要刷入的系统类型，操作会有所不同：  

#### A. 刷入官方系统 (卡刷/线刷)

- **官方线刷 (使用 MiFlash 工具)：** 常用来救砖，刷机包去官网找，解压后进入miflash添加后点击开始刷机，右下角千万别点全部删除并lock，否则会锁上bl锁，还得重新解一遍。
    
- **官方卡刷：** 将官方完整包（.zip 格式）下载到平板内部存储，然后在“设置” > “我的设备” > “MIUI 版本”中，点击右上角三个点，选择“手动选择安装包”进行升级/降级。
    

#### B. 刷入第三方 ROM (通过 Recovery)

1. **进入第三方 Recovery (如 橙狐)：**
    
2. **双清/三清 (Wipe)：** 在 Recovery 中选择“清除 (Wipe)”，执行“双清”操作（清除 Data/Cache/Dalvik Cache）。**除非您清楚知道自己在做什么，否则请勿清除 Internal Storage。**
    
3. **刷入 ROM 包：** 选择“安装 (Install)”，找到您提前放进平板存储中的第三方 ROM 包 (.zip 格式)，滑动确认刷入。
    
4. **重启系统：** 刷机完成后，选择“重启系统 (Reboot System)”。第一次启动会比较慢，请耐心等待。
5. **注意**：若是长时间未进入系统，重新刷一遍或是注意刷机包是不是你的型号(elish)。  
#### C. 刷入第三方 ROM (通过电脑线刷)
**推荐使用**  
作者通常在刷机包内会留有自带的刷机工具，设备进入fastboot模式连接电脑，双击运行就行，一键刷机，非常方便。
![](https://cdn.jsdelivr.net/gh/JiangVL/blogimages/img/elish-flashing/Snipaste_2025-12-07_09-49-57.webp)
这里通常都是双清，除非刷机包是同一个作者并且在帖子里标注可以保留数据升级，例如：同作者的澎湃1.0升澎湃2.0升澎湃3.0，其余情况一律双清
![](https://cdn.jsdelivr.net/gh/JiangVL/blogimages/img/elish-flashing/Snipaste_2025-12-07_09-50-52.webp)

静静等待刷机完成即可，完成后自动重启进去系统。

没有线刷脚本的可以使用一些刷机工具箱例如[柚坛工具箱](https://toolbox.uotan.cn/)可以极大的方便我们操作，避免使用传统fastboot adb命令出错，一般的作者包内都带有刷机工具，我也只在刷类原生的时候用到它。
### **注意事项：**

如果您在刷机过程中遇到任何问题，例如卡在某个步骤或设备无法正常启动，请**停止操作**，别瞎操作，尝试重新刷入，一般只要别瞎弄没啥问题，你不乱删除啥啥分区只刷系统的话，弄的进不去系统卡住，只要从miflsh重新刷回去就行了。  
你要实在没把握，担心就去闲鱼上找人代刷，即使你乱玩变成砖了，他也能给你救回来，所以也别太担心。  
我正常刷机都是一遍过。

---

![文章封面图](https://cdn.jsdelivr.net/gh/JiangVL/blogimages/img/elish-flashing/Screenshot_2025-12-07-09-11-52-660_com.android.settings.webp)
