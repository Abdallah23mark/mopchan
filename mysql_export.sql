-- MySQL Export for DirectAdmin
-- Generated on 2025-06-23T04:53:19.653Z

SET FOREIGN_KEY_CHECKS = 0;

-- Create threads table
DROP TABLE IF EXISTS threads;
CREATE TABLE threads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  post_number INT NOT NULL,
  subject TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  image_name TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  bumped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reply_count INT DEFAULT 0,
  image_count INT DEFAULT 0,
  name VARCHAR(255) DEFAULT 'Anonymous',
  tripcode VARCHAR(255),
  is_admin_post TINYINT(1) DEFAULT 0,
  ip_address VARCHAR(45)
);

-- Create posts table
DROP TABLE IF EXISTS posts;
CREATE TABLE posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  thread_id INT NOT NULL,
  post_number INT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  image_name TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  name VARCHAR(255) DEFAULT 'Anonymous',
  tripcode VARCHAR(255),
  is_admin_post TINYINT(1) DEFAULT 0,
  ip_address VARCHAR(45)
);

-- Create users table
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  is_admin TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create chat_messages table
DROP TABLE IF EXISTS chat_messages;
CREATE TABLE chat_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  tripcode VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ip_bans table
DROP TABLE IF EXISTS ip_bans;
CREATE TABLE ip_bans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ip_address VARCHAR(45) UNIQUE NOT NULL,
  reason TEXT,
  banned_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL
);

-- Create sessions table
DROP TABLE IF EXISTS sessions;
CREATE TABLE sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id INT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create thread_pins table
DROP TABLE IF EXISTS thread_pins;
CREATE TABLE thread_pins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  thread_id INT NOT NULL,
  pinned_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert data into threads
INSERT INTO threads (id, subject, content, image_url, image_name, created_at, bumped_at, reply_count, image_count, name, tripcode, is_admin_post, ip_address, post_number) VALUES
(27, 'are you having fun?', 'let us know what u think', '/uploads/73293ad379f457ae4818ad57c066dbb3', 'jorb14.png', '2025-06-20 03:23:29', '2025-06-20 03:23:29', 0, 1, 'w0rtz', NULL, 1, NULL, 130),
(35, 'rare jorbie thread', 'post em', '/uploads/92f05009444abb257f27c546d07311e4', 'jorbcasino9.png', '2025-06-20 14:36:33', '2025-06-20 14:40:38', 1, 1, 'Anonymous', NULL, 0, NULL, 158),
(37, NULL, 'oh no 
not me
i never posted coal
you’re face
to face
with the man who sold the board', '/uploads/6618373b1601b78e2d5ca7e78cc78873', 'IMG_7062.jpeg', '2025-06-21 00:41:11', '2025-06-21 00:41:11', 0, 1, 'skimbop', NULL, 0, NULL, 164),
(30, 'webm test', 'saaaaar it is a webm general pls kindly do needful and post webm', '/uploads/7dc99c2cfd55c79cc40736385b7eb656', 'OMG! This Indian Monkey Can DANCE! Viral Hindi Song Moves! #trending #monkey #funny #viralvideo [TubeRipper.com].webm', '2025-06-20 03:55:54', '2025-06-20 04:11:12', 9, 1, 'Anonymous', NULL, 0, NULL, 149),
(2, NULL, 'asdas', NULL, NULL, '2025-06-19 05:25:01', '2025-06-19 05:29:53', 1, 0, 'Anonymous', NULL, 0, NULL, 2),
(3, NULL, 'awfwa', NULL, NULL, '2025-06-19 05:41:57', '2025-06-19 05:41:57', 0, 0, 'awasdawdwa', NULL, 0, NULL, 4),
(4, NULL, 'awdsawd
>adawfdwafw', NULL, NULL, '2025-06-19 05:42:18', '2025-06-19 05:42:18', 0, 0, 'awfwafda', NULL, 0, NULL, 5),
(7, NULL, 'ff', NULL, NULL, '2025-06-19 05:45:49', '2025-06-19 05:45:49', 0, 0, 'hhhh', NULL, 0, NULL, 9),
(8, 'aaa', 'aaaa', NULL, NULL, '2025-06-19 05:46:03', '2025-06-19 05:46:03', 0, 0, 'aaa', NULL, 0, NULL, 10),
(9, NULL, 'aaa', NULL, NULL, '2025-06-19 05:47:04', '2025-06-19 05:47:04', 0, 0, 'aaa', NULL, 0, NULL, 11),
(10, NULL, 'aaaa', NULL, NULL, '2025-06-19 05:49:36', '2025-06-19 05:52:00', 5, 0, 'aaa', NULL, 1, NULL, 12),
(16, NULL, 'me & GL', '/uploads/bb3a2c92fea36fb019256bc2d9168296', 'IMG_6900.jpeg', '2025-06-19 22:42:24', '2025-06-20 02:57:48', 1, 1, 'Anonymous', NULL, 0, NULL, 66),
(17, 'wholsy', 'goodluck on your new job adventure', '/uploads/34e4b1cd3940f2f066ad6ecb98facbaa', 'IMG_6888.jpeg', '2025-06-19 22:44:18', '2025-06-20 04:54:28', 15, 1, 'Anonymous', NULL, 0, NULL, 67),
(34, 'blog post', 'disillusioned 26 year alcoholic musician in new jersey rant post

i’m a musician with fluctuating ~1,000 listeners on spotify. ‘my most streamed song has like 20k plays. i make edgy/industrial electronic uk garage/digital hardcore/punk/whatever i feel like. even getting to ~1,000 listeners was hard and the scene surrounding the music i make is full of the most insufferable man children and bpd hoes that make it impossible to enjoy anything as everyone i know, including myself, is cancelled to some degree. these people don’t make music for any other reason to do drugs and try to get laid with the most mentally ill women. sure there’s some artists that i admire and part of me being bitter was being exiled shamefully because of a false accusation, but at the end of the day, i have more streams than all of them combined. which doesn’t matter, but it’s the metric they care about. they’re playing the same 6 venues. i make art that i like, because im obsessed with music and i have to make the music i like cause im obsessed with trying create shit that teenage me would listen to and be like holy crap this rocks. i’m so disillusioned with this whole thing and ive been to rehab like 4 times and im just now starting to get back into a minimum wage job at 26 years old after overdosing a few months ago. i have a cute partner and before this i was in a relationship so toxic i almost killed myself. i put myself in these situations, im a diabetic bipolar alcoholic and i still for some reason want to make music of all things. my friends think im really funny and should do standup or something and some part of me gets a lot of hope from seeing people like adam friedland and stavvy blowing up and it makes me want to pursue creativity in some way, because i fuck up every job i ever have. although ive never been sober for longer than 6 months (i have 4 now) i dont know. i need to find a career path that makes me money somehow and i have 3 years of a social work degree. i fell for the “le artist” meme and i still view myself as that but i know its time to grow up. i’m scared as fuck and need to get my shit together some how cause i don’t wanna be a fucking loser when i’m 30. this is a cry for help', '/uploads/ba5769b5792e33ddc7769c5fc814a152', 'IMG_4434.jpeg', '2025-06-20 14:18:52', '2025-06-20 15:16:46', 3, 2, 'Anonymous', NULL, 0, NULL, 156),
(15, 'poop thread', 'poopson', '/uploads/5afa8496b0b79cf2136048d304f67b01', 'IMG_7650.jpeg', '2025-06-19 16:12:01', '2025-06-21 13:27:34', 3, 1, 'Anonymous', NULL, 0, NULL, 59),
(36, '46ers', '46ers', '/uploads/89fe566b5050cbe4bf552cd511dceccf', 'IMG_7149.jpeg', '2025-06-20 18:06:00', '2025-06-21 17:11:34', 2, 1, 'Anonymous', NULL, 0, NULL, 162),
(14, 'welcome to mopchan', 'we haz chezburger xd', '/uploads/562fa6156a841fccc4c26586aaba7b06', 'mopworld3.png', '2025-06-19 07:14:59', '2025-06-20 01:52:38', 5, 1, 'w0rtz', NULL, 1, NULL, 57),
(23, 'Image Test Thread', 'Testing image upload functionality after fixes', '/uploads/3c7dd4cbfd9fcdadacc9be6c63580aa9', 'mopworld3_1750301952062.png', '2025-06-20 03:04:14', '2025-06-20 03:04:14', 0, 1, 'ImageTester', NULL, 0, NULL, 122),
(21, NULL, 'Mmm yes all my children all in one place, excellent.', '/uploads/imagenotfound_placeholder.png', 'imagenotfound2.png', '2025-06-20 02:56:13', '2025-06-20 02:57:21', 1, 1, 'Wormauthor', NULL, 0, NULL, 116),
(13, 'aaa', 'aaaa', NULL, NULL, '2025-06-19 05:55:41', '2025-06-19 07:09:02', 31, 0, 'aa', NULL, 0, NULL, 22),
(19, NULL, 'GEMMY GEMERALDO', '/uploads/e75a87e76207a07a0ab78a98c4a904b2', 'gemmy-soyjak.gif', '2025-06-20 01:45:18', '2025-06-20 03:33:25', 47, 1, 'Anonymous', NULL, 0, NULL, 83),
(22, NULL, 'can u see this', '/uploads/4a42443e00d7a81c9c28cd5f44ece44a', 'IMG_6926.jpeg', '2025-06-20 03:02:38', '2025-06-20 04:22:30', 2, 1, 'Anonymous', NULL, 0, NULL, 120),
(38, 'HATE', '>HATE NIGGERS
>HATE SPICS
>HATE KIKES
>HATE PACHA
>RAPE THEM ALL', '/uploads/20e2f9660009ca603414917e080a5a37', 'IMG_4612.jpeg', '2025-06-21 17:15:44', '2025-06-21 17:36:56', 2, 1, 'ANON TROLL (YOULL NEVER FIND OUT)', NULL, 0, NULL, 167);

-- Insert data into posts
INSERT INTO posts (id, thread_id, content, image_url, image_name, created_at, name, tripcode, is_admin_post, ip_address, post_number) VALUES
(103, 19, 'Test direct post creation', NULL, NULL, '2025-06-20 03:21:15', 'TestUser', NULL, 0, NULL, 129),
(110, 19, 'Final test of quote system >>137 >>83 with click-to-scroll functionality', NULL, NULL, '2025-06-20 03:30:01', 'FinalQuoteTest', NULL, 0, NULL, 138),
(115, 22, '>>120
seen', NULL, NULL, '2025-06-20 03:38:15', 'Anonymous', NULL, 0, NULL, 143),
(120, 32, 'Testing centered webm display in thread cards', NULL, NULL, '2025-06-20 03:59:13', 'CenterTest', NULL, 0, NULL, 151),
(130, 33, '>>152
>hello', '/uploads/b3a10dad3b40bcc21f707d11de946bd5', 'acaf0927590e7e40ffe60d5f81d0e7c0.jpg', '2025-06-20 04:18:09', 'Anonymous', NULL, 0, NULL, 153),
(132, 17, '>>69
hello', NULL, NULL, '2025-06-20 04:54:28', 'Anonymous', NULL, 0, NULL, 155),
(136, 34, 'just learn to code bro', NULL, NULL, '2025-06-20 15:16:46', 'skimbop', NULL, 0, NULL, 161),
(1, 2, 'wafwadfawa', NULL, NULL, '2025-06-19 05:29:53', 'awd', NULL, 0, NULL, 3),
(2, 5, 'wafdwa', NULL, NULL, '2025-06-19 05:43:29', 'Anonymous', NULL, 0, NULL, 7),
(15, 13, '>hiiii', NULL, NULL, '2025-06-19 06:26:15', 'Anonymous', NULL, 0, NULL, 28),
(12, 13, 'Test message to verify display works', NULL, NULL, '2025-06-19 05:58:05', 'TestUser', NULL, 0, NULL, 25),
(104, 19, 'Testing post creation with simplified numbering logic', NULL, NULL, '2025-06-20 03:23:39', 'PostFixTest', NULL, 0, NULL, 132),
(111, 19, '>>136
hi', NULL, NULL, '2025-06-20 03:30:56', 'Anonymous', NULL, 0, NULL, 139),
(116, 29, 'Testing webm display >>144 should now work properly', NULL, NULL, '2025-06-20 03:44:02', 'WebMFixer', NULL, 0, NULL, 145),
(131, 22, '>>120
>test', NULL, NULL, '2025-06-20 04:22:30', 'hello', NULL, 0, NULL, 154),
(133, 34, 'ur fucked nigga', '/uploads/e612b3c81b8b4a38cbbd4d23e2dfeded', 'IMG_6098.jpeg', '2025-06-20 14:35:32', 'Anonymous', NULL, 0, NULL, 157),
(137, 36, 'one of these days, brother. one of these days…', NULL, NULL, '2025-06-21 00:22:22', 'skimbop', NULL, 0, NULL, 163),
(13, 13, 'Testing admin controls security', NULL, NULL, '2025-06-19 06:01:15', 'SecurityTest', NULL, 0, NULL, 26),
(14, 13, 'Testing with all admin controls disabled', NULL, NULL, '2025-06-19 06:02:11', 'SecurityTest2', NULL, 0, NULL, 27),
(16, 6, '>>No. 6
hi', NULL, NULL, '2025-06-19 06:27:23', 'Anonymous', NULL, 0, NULL, 29),
(17, 13, '>this is a test of greentext
>multiple lines
normal text', NULL, NULL, '2025-06-19 06:27:25', 'GreenTextTest', NULL, 0, NULL, 30),
(18, 6, '>aaaaaa', NULL, NULL, '2025-06-19 06:27:41', 'Anonymous', NULL, 0, NULL, 31),
(19, 13, '>this should be green text
>>1234 this should be a quote link
normal text here', NULL, NULL, '2025-06-19 06:28:15', 'FormatTest', NULL, 0, NULL, 32),
(20, 13, 'Testing admin red text functionality', NULL, NULL, '2025-06-19 06:28:34', 'AdminTest', NULL, 1, NULL, 33),
(21, 13, '>Testing greentext again
>>1234 quote test
Regular text', NULL, NULL, '2025-06-19 06:29:07', 'TestUser2', NULL, 0, NULL, 34),
(22, 13, '>Testing greentext formatting
>>1234 quote link test
Normal text here', NULL, NULL, '2025-06-19 06:32:58', 'TestFormatting', NULL, 0, NULL, 35),
(23, 13, '>This is greentext
>>123 This is a quote link
This is normal text
>More greentext', NULL, NULL, '2025-06-19 06:34:34', 'FormatTest2', NULL, 0, NULL, 36),
(24, 13, 'This is an ADMIN POST with red text
>Admin greentext should still be red
>>456 Admin quote links should be red too', NULL, NULL, '2025-06-19 06:34:47', 'Administrator', NULL, 1, NULL, 37),
(25, 5, '>>No. 2
sss', NULL, NULL, '2025-06-19 06:34:49', 'Anonymous', NULL, 0, NULL, 38),
(105, 19, '>>83
hi', NULL, NULL, '2025-06-20 03:27:04', 'Anonymous', NULL, 0, NULL, 133),
(106, 19, '>>103
hi', NULL, NULL, '2025-06-20 03:27:17', 'Anonymous', NULL, 0, NULL, 134),
(107, 19, 'Testing quote system with post numbers >>133 >>132 should reference the proper posts now', NULL, NULL, '2025-06-20 03:28:05', 'QuoteTest', NULL, 0, NULL, 135),
(112, 19, 'Testing quote click functionality >>139 >>83 - clicking these should scroll to the referenced posts', NULL, NULL, '2025-06-20 03:31:48', 'ClickTest', NULL, 0, NULL, 140),
(117, 29, 'Testing improved webm display with explicit styling', NULL, NULL, '2025-06-20 03:45:03', 'VideoStyleTest', NULL, 0, NULL, 146),
(138, 15, 'poop', NULL, NULL, '2025-06-21 13:27:34', 'Anonymous', NULL, 0, NULL, 165),
(26, 13, '>This should be greentext
>>123 This should be a blue quote link  
Normal text with >>456 quote in middle
>Another greentext line', NULL, NULL, '2025-06-19 06:35:41', 'QuoteTest', NULL, 0, NULL, 39),
(27, 13, 'Testing admin red text with >>789 quote links', NULL, NULL, '2025-06-19 06:35:52', 'AdminTest', NULL, 1, NULL, 40),
(28, 13, '>>No. 26', NULL, NULL, '2025-06-19 06:36:23', 'Anonymous', NULL, 0, NULL, 41),
(29, 13, '>>26 This should show as No. 26 with hover
>greentext with >>27 quote link  
Regular text with >>10 another quote', NULL, NULL, '2025-06-19 06:37:31', 'QuoteLinkTest', NULL, 0, NULL, 42),
(30, 13, 'Testing complete formatting system:
>This should be green text
>>29 This should be blue quote link  
Normal text with >>10 another quote
>More green text', NULL, NULL, '2025-06-19 06:40:56', 'CompleteTest', NULL, 0, NULL, 43),
(31, 13, 'Testing hover preview:
>>30 This should show a preview when hovering
>Some greentext here
Regular text with >>10 another hover test', NULL, NULL, '2025-06-19 06:42:20', 'HoverTest', NULL, 0, NULL, 44),
(32, 13, 'Final hover test:
>>31 Hover over this to see post preview
>Green text example  
>>10 Another hover test here', NULL, NULL, '2025-06-19 06:42:54', 'FinalHoverTest', NULL, 0, NULL, 45),
(33, 13, 'Simple test without quotes first', NULL, NULL, '2025-06-19 06:43:57', 'SimpleTest', NULL, 0, NULL, 46),
(34, 13, 'Testing quote hover:
>>33 This should show preview  
>Some greentext
Normal text with >>10 quote', NULL, NULL, '2025-06-19 06:44:21', 'QuoteHoverTest', NULL, 0, NULL, 47),
(35, 13, 'Testing without hover crash:
>>34 This should not crash now
>Some greentext
Normal text', NULL, NULL, '2025-06-19 06:45:15', 'NoCrashTest', NULL, 0, NULL, 48),
(36, 13, 'Testing rebuilt hover:
>>35 This should show hover preview
>Greentext test
Normal text with >>10 quote', NULL, NULL, '2025-06-19 06:46:08', 'HoverRebuildTest', NULL, 0, NULL, 49),
(37, 13, 'Testing no-crash quotes:
>>36 Click this to scroll to post
>Some green text
Normal text with >>10 another link', NULL, NULL, '2025-06-19 06:47:24', 'NoCrashTest', NULL, 0, NULL, 50),
(38, 13, 'Testing new hover system:
>>37 This should show hover preview
>Green text test
Normal text with >>10 another quote', NULL, NULL, '2025-06-19 06:49:28', 'HoverTest2', NULL, 0, NULL, 51),
(39, 13, 'Final hover test:
>>38 Hover over this quote link
>This is green text
>>10 Another quote for testing', NULL, NULL, '2025-06-19 06:49:42', 'FinalTest', NULL, 0, NULL, 52),
(40, 13, 'Testing fixed hover functions:
>>39 This should work now with hover
>Green text still works
>>10 Another quote test', NULL, NULL, '2025-06-19 06:50:52', 'FixedHoverTest', NULL, 0, NULL, 53),
(41, 13, 'Testing simplified quote links:
>>40 This is a quote link (no hover)
>This is greentext
Normal text here', NULL, NULL, '2025-06-19 06:51:53', 'SimplifiedTest', NULL, 0, NULL, 54),
(42, 13, 'Testing fixed hover functionality:
>>41 This should show hover preview now
>Green text still works fine
>>10 Another quote for testing', NULL, NULL, '2025-06-19 06:53:18', 'HoverWorksTest', NULL, 0, NULL, 55),
(43, 13, 'hi hi hi', NULL, NULL, '2025-06-19 07:09:02', 'hi hi hi', NULL, 0, NULL, 56),
(44, 14, 'love trooning out', '/uploads/b8aaa9e0a6a6c410abedd6c2b4606127', 'IMG_4465.png', '2025-06-19 16:09:57', 'az', NULL, 0, NULL, 58),
(45, 14, 'hanging w cousin readin troony magazines', NULL, NULL, '2025-06-19 16:13:20', 'Anonymous', NULL, 0, NULL, 60),
(46, 1, 'Test reply
<Test>', NULL, NULL, '2025-06-19 16:19:42', 'Oo7', NULL, 0, NULL, 61),
(47, 15, 'kino', NULL, NULL, '2025-06-19 16:20:07', 'w0rtz', NULL, 1, NULL, 62),
(48, 14, '>>No. 45
kek', NULL, NULL, '2025-06-19 16:20:48', 'w0rtz', NULL, 1, NULL, 63),
(49, 14, '>>No. 48', NULL, NULL, '2025-06-19 16:22:13', 'lollll ', 'Z1Y6', 0, NULL, 64),
(50, 15, 'Poop', NULL, NULL, '2025-06-19 22:00:09', 'Anonymous', NULL, 0, NULL, 65),
(51, 17, '>>No. 17
i love u', NULL, NULL, '2025-06-20 01:14:53', 'Anonymous', NULL, 0, NULL, 68),
(52, 17, 'Testing quotes again:
>>17 This should be a working quote link
>This is greentext
>>51 Another quote', NULL, NULL, '2025-06-20 01:16:08', 'QuoteFixTest', NULL, 0, NULL, 69),
(53, 17, 'Final quote test:
>>52 This should work with hover
>Greentext should be green
Normal text here', NULL, NULL, '2025-06-20 01:16:38', 'FinalQuoteTest', NULL, 0, NULL, 70),
(54, 17, 'Testing vibrant yellow highlight:
>>53 Click this quote to see brighter yellow
>Greentext test
Normal text', NULL, NULL, '2025-06-20 01:19:12', 'VibrantYellowTest', NULL, 0, NULL, 71),
(55, 17, 'Testing bright yellow #ffff08:
>>54 Click this for the new bright yellow color
>Greentext works
Normal text', NULL, NULL, '2025-06-20 01:20:01', 'BrightYellowTest', NULL, 0, NULL, 72),
(56, 17, 'Testing hover preview restored:
>>55 Hover over this quote to see preview
>Greentext still works
>>53 Another hover test', NULL, NULL, '2025-06-20 01:22:00', 'HoverRestoredTest', NULL, 0, NULL, 73),
(57, 17, 'Testing hover again:
>>56 Hover over this to see preview
>Green text test
>>54 Another hover test', NULL, NULL, '2025-06-20 01:22:54', 'HoverTestAgain', NULL, 0, NULL, 74),
(58, 17, 'Testing username display fix:
Name field should now update correctly in modal
>Test greentext
>>57 Quote test', NULL, NULL, '2025-06-20 01:32:32', 'TestUser', NULL, 0, NULL, 75),
(60, 17, '>>No. 59
>hi', NULL, NULL, '2025-06-20 01:33:31', 'Anonymous', NULL, 0, NULL, 77),
(61, 17, 'Testing formatted hover preview:
>>58 This preview should show greentext and quotes
>This should appear green in the preview
>>56 Another quote link
Normal text here', NULL, NULL, '2025-06-20 01:35:41', 'FormattedPreviewTest', NULL, 0, NULL, 78),
(62, 17, 'Testing formatted preview with correct styling:
>>61 This should show proper formatting
>This greentext should appear green in preview
>>17 Another quote
Regular text here', NULL, NULL, '2025-06-20 01:41:05', 'StyledPreviewTest', NULL, 0, NULL, 79),
(63, 17, 'Testing catalog image click fix:
Should now open thread instead of downloading image
>Test from catalog page
>>62 Quote test', NULL, NULL, '2025-06-20 01:42:49', 'CatalogFixTest', NULL, 0, NULL, 80),
(96, 21, 'who tis', NULL, NULL, '2025-06-20 02:57:21', 'w0rtz', NULL, 1, NULL, 117),
(64, 17, 'Testing webm upload support:
Now supports WEBM video files
>Upload functionality enhanced
>>63 Previous test quote', NULL, NULL, '2025-06-20 01:43:48', 'WebmSupportTest', NULL, 0, NULL, 81),
(65, 19, '>>No. 19
>hi how are you', '/uploads/8e5a1cbe6e4cc7c9a9b3a08b39068438', 'mopworld3.png', '2025-06-20 01:46:30', 'hello', NULL, 0, NULL, 84),
(66, 19, '>>No. 65
xD', NULL, NULL, '2025-06-20 01:46:48', 'Anonymous', NULL, 0, NULL, 85),
(67, 19, 'Testing quote fix:
>>19 This should work now
>>No. 65 This format should also work
>>66 And this one too', NULL, NULL, '2025-06-20 01:48:30', 'QuoteFixTest', NULL, 0, NULL, 86),
(68, 19, 'Final quote test:
>>19 Basic format
>>No. 65 Full format
>>66 Another basic
>This is greentext
Regular text here', NULL, NULL, '2025-06-20 01:48:48', 'FinalQuoteTest', NULL, 0, NULL, 87),
(69, 19, 'Error fix test:
>>19 Testing after fix
>Should work now
Regular text', NULL, NULL, '2025-06-20 01:49:38', 'ErrorFixTest', NULL, 0, NULL, 88),
(70, 19, '>>No. 69
it works', NULL, NULL, '2025-06-20 01:50:43', 'Anonymous', NULL, 0, NULL, 90),
(71, 14, 'hi', NULL, NULL, '2025-06-20 01:52:38', 'tripcode test ', 'WCPS', 0, NULL, 91),
(72, 19, 'Testing double No. fix:
>>19 Basic format
>>No. 65 Full format should not duplicate
>>66 Another test', NULL, NULL, '2025-06-20 01:54:19', 'DoubleNoFixTest', NULL, 0, NULL, 92),
(73, 19, '>>No. 19', NULL, NULL, '2025-06-20 01:54:37', 'Anonymous', NULL, 0, NULL, 93),
(74, 19, '>>No. 73', NULL, NULL, '2025-06-20 01:55:47', 'Anonymous', NULL, 0, NULL, 94),
(75, 19, 'Final duplicate test:
>>No. 19 Should not duplicate
>>65 Should add No.
>>No. 66 Should not duplicate', NULL, NULL, '2025-06-20 01:55:49', 'FinalDuplicateTest', NULL, 0, NULL, 95),
(76, 19, 'Testing real-time chat functionality:
Chat should now be persistent and visible to all users
>Testing WebSocket connection
Real-time messaging enabled', NULL, NULL, '2025-06-20 02:18:25', 'ChatFixTest', NULL, 0, NULL, 96),
(77, 19, 'Testing chatroom after database fix:
Chat should now work properly
>Persistent messaging enabled
>>76 Previous test quote', NULL, NULL, '2025-06-20 02:22:04', 'ChatDatabaseTest', NULL, 0, NULL, 97),
(78, 19, 'Testing chat after frontend fixes:
Should work now without crashes
>Fixed variable names and handlers
Testing real-time functionality', NULL, NULL, '2025-06-20 02:23:05', 'ChatFrontendFix', NULL, 0, NULL, 98),
(79, 19, 'Testing simplified chatroom:
Completely rewrote component for stability
>Should not crash page anymore
Real-time messaging preserved', NULL, NULL, '2025-06-20 02:24:35', 'SimplifiedChatTest', NULL, 0, NULL, 99),
(80, 19, 'Testing minimal chatroom component:
Removed all complex dependencies
>Should work without crashes now
Basic local messaging for testing', NULL, NULL, '2025-06-20 02:25:50', 'MinimalChatTest', NULL, 0, NULL, 100),
(81, 19, 'Testing restored chatroom functionality:
>Auto-generated usernames restored
>Original aesthetics and styling
>Real database persistence with WebSocket
Should work properly now', NULL, NULL, '2025-06-20 02:27:46', 'ChatroomRestoreTest', NULL, 0, NULL, 101),
(82, 19, 'Testing WebSocket message broadcasting:
Messages should appear instantly for all users
>Real-time chat functionality test
>>81 Previous test reference', NULL, NULL, '2025-06-20 02:31:42', 'WebSocketTest', NULL, 0, NULL, 102),
(83, 19, 'Testing WebSocket message handling:
Added detailed frontend logging
>Should see console logs on message receive
Debug WebSocket communication', NULL, NULL, '2025-06-20 02:35:19', 'WSFrontendTest', NULL, 0, NULL, 103),
(84, 19, 'Testing improved WebSocket stability:
>Enhanced connection management
>Added ping/pong mechanism
>Better state handling for real-time updates
Should work now!', NULL, NULL, '2025-06-20 02:37:05', 'WSStabilityTest', NULL, 0, NULL, 104),
(85, 19, 'Fixed chatroom auto-scroll behavior:
>Only scrolls down when user is near bottom
>Prevents forced scrolling interruption
>Natural chat experience maintained
Testing scroll fix!', NULL, NULL, '2025-06-20 02:39:58', 'ScrollFixTest', NULL, 0, NULL, 105),
(86, 19, 'Fixed scroll detection logic:
>Using proper chat container element ID
>Better scroll position detection
>Only scrolls when user is actually at bottom
Should prevent forced scrolling now', NULL, NULL, '2025-06-20 02:40:45', 'ScrollLogicFix', NULL, 0, NULL, 106),
(87, 19, 'Simplified scroll behavior:
>Only scrolls to bottom on initial message load
>No forced scrolling during conversation
>Users maintain full scroll control
Perfect chat experience', NULL, NULL, '2025-06-20 02:41:01', 'NoAutoScrollFix', NULL, 0, NULL, 107),
(88, 19, 'Fixed chatroom auto-scroll properly:
>Auto-scrolls within chat container only
>Does not affect main page scrolling
>Smart scroll detection for user experience
Perfect chatroom behavior now!', NULL, NULL, '2025-06-20 02:41:58', 'ChatScrollFix', NULL, 0, NULL, 108),
(89, 19, 'Enhanced chatroom initial position:
>Opens at bottom showing newest messages
>Smooth scroll behavior on load
>Better user experience from start
Perfect chat positioning!', NULL, NULL, '2025-06-20 02:43:00', 'ChatInitialScroll', NULL, 0, NULL, 109),
(90, 19, 'Fixed chatroom layout and message handling:
>Set proper horizontal sizing with max-width
>Added word wrapping for long messages
>Increased character limit to 2000
>Improved message display formatting
Perfect chatroom behavior!', NULL, NULL, '2025-06-20 02:45:28', 'ChatLayoutFix', NULL, 0, NULL, 110),
(91, 19, 'Fixed chatroom initial scroll position:
>Always starts at bottom showing newest messages
>Proper first load detection and handling
>Maintains scroll behavior for ongoing chat
>Perfect initial positioning!', NULL, NULL, '2025-06-20 02:46:54', 'ChatInitialScrollFinal', NULL, 0, NULL, 111),
(92, 19, 'Testing WebSocket reconnection fixes:
>Added duplicate message prevention
>Enhanced reconnection logic for dropped connections
>Better error handling and logging
Should maintain stable real-time updates', NULL, NULL, '2025-06-20 02:51:59', 'WSReconnectFix', NULL, 0, NULL, 112),
(93, 19, 'Implementing robust WebSocket connection:
>Complete rewrite of connection management
>Auto-reconnection on unexpected disconnects
>Better state handling and cleanup
>Prevents duplicate connections
Real-time chat should work reliably now', NULL, NULL, '2025-06-20 02:52:30', 'WSRobustFix', NULL, 0, NULL, 113),
(94, 19, 'Enhanced WebSocket debugging:
>Added comprehensive logging for React state updates
>Improved message processing with detailed console output
>Force state re-rendering with new array references
Testing real-time message updates now', NULL, NULL, '2025-06-20 02:55:21', 'WSDebugEnhanced', NULL, 0, NULL, 114),
(3, 10, 'Test post content', NULL, NULL, '2025-06-19 05:51:08', 'TestUser', NULL, 0, NULL, 13),
(4, 10, 'This should be red admin text', NULL, NULL, '2025-06-19 05:51:18', 'AdminUser', NULL, 0, NULL, 14),
(5, 10, 'Debug test with admin flag', NULL, NULL, '2025-06-19 05:51:29', 'TestAdmin', NULL, 0, NULL, 15),
(6, 10, 'Final admin test post', NULL, NULL, '2025-06-19 05:51:39', 'AdminTest', NULL, 0, NULL, 16),
(7, 10, 'Testing admin post with new boolean logic', NULL, NULL, '2025-06-19 05:52:00', 'AdminUser', NULL, 1, NULL, 17),
(8, 12, 'Test debug message', NULL, NULL, '2025-06-19 05:54:45', 'TestUser', NULL, 0, NULL, 20),
(9, 12, 'Final test message', NULL, NULL, '2025-06-19 05:55:20', 'TestUser2', NULL, 0, NULL, 21),
(10, 13, 'This is a simple test message to debug the display issue', NULL, NULL, '2025-06-19 05:56:24', 'DebugUser', NULL, 0, NULL, 23),
(11, 13, '>greentext test
normal text
>>999 post reference', NULL, NULL, '2025-06-19 05:57:25', 'TestFormatting', NULL, 0, NULL, 24),
(59, 17, '>>No. 51
>hi', NULL, NULL, '2025-06-20 01:33:24', 'adwads', NULL, 1, NULL, 76),
(108, 19, '>>129
hi', NULL, NULL, '2025-06-20 03:28:39', 'Anonymous', NULL, 0, NULL, 136),
(113, 19, 'Final quote click test >>140 >>83 - these should now work correctly', NULL, NULL, '2025-06-20 03:32:23', 'FinalClickTest', NULL, 0, NULL, 141),
(118, 29, 'Testing video with CSS fix - should have black background', NULL, NULL, '2025-06-20 03:45:14', 'CSSFixTest', NULL, 0, NULL, 147),
(134, 35, 'tkd tkd tkd', '/uploads/438cc0d55b07f386ecf51672a816bb62', 'jorbcopter3.png', '2025-06-20 14:40:38', 'Anonymous', NULL, 0, NULL, 159),
(139, 36, 'skimbop this could be us', '/uploads/e5a8b45590a759c67a60549a5029dfc1', 'IMG_6915.jpeg', '2025-06-21 17:11:34', 'Anonymous', NULL, 0, NULL, 166),
(143, 38, 'RED ALERT
RED ALERT
MOPCHAN IS BEING RAIDED', '/uploads/37d8b4b98059e8a26550c562711d79fd', 'IMG_0338.gif', '2025-06-21 17:36:56', 'Anonymous', NULL, 0, NULL, 169),
(109, 19, 'Testing fixed quote system >>135 >>83 should now properly reference posts by their global post numbers', NULL, NULL, '2025-06-20 03:29:48', 'QuoteFixTest', NULL, 0, NULL, 137),
(114, 19, 'Testing restored highlight >>141 >>83 should now use yellow highlight', NULL, NULL, '2025-06-20 03:33:25', 'HighlightTest', NULL, 0, NULL, 142),
(119, 29, 'Final webm test with improved CSS and error handling', NULL, NULL, '2025-06-20 03:45:37', 'FinalWebMTest', NULL, 0, NULL, 148),
(135, 34, 'I LOVVVVVVE YOUUUU', '/uploads/2e1ad185524e73002ff38120097ec216', 'IMG_6419.jpeg', '2025-06-20 15:08:34', 'Anonymous', NULL, 0, NULL, 160),
(140, 38, 'wtf why did you single out pacha i think she’s pretty cool and sweet :/', NULL, NULL, '2025-06-21 17:16:21', 'Anonymous', NULL, 0, NULL, 168),
(95, 19, 'Implementing ref-based message tracking:
>Using useRef to prevent stale closure issues
>Force updates with state counter
>Better WebSocket send validation
>Should fix React state update problems', NULL, NULL, '2025-06-20 02:55:45', 'RefBasedMessages', NULL, 0, NULL, 115),
(97, 16, 'This is gaytarded', NULL, NULL, '2025-06-20 02:57:48', 'Anonymous', NULL, 0, NULL, 118),
(98, 19, 'Enhanced chatroom opening animation:
>Removed delayed scroll effects
>Added smooth CSS transitions
>Immediate scroll positioning on load
>Fluid opening experience without jarring movements', NULL, NULL, '2025-06-20 03:02:02', 'SmoothChatOpen', NULL, 0, NULL, 119),
(99, 19, 'Testing image persistence fix:
>Added explicit static file serving for uploads
>Checking database image URL storage
>Should resolve disappearing images issue', NULL, NULL, '2025-06-20 03:03:47', 'ImagePersistFix', NULL, 0, NULL, 121),
(100, 19, 'Fixed broken image handling:
>Added graceful error handling for missing images
>Cleaned up broken reference in Thread #21 database
>Images now show ''Image not available'' instead of broken links
>Better user experience for missing files', NULL, NULL, '2025-06-20 03:05:47', 'ImageErrorFix', NULL, 0, NULL, 123),
(101, 19, 'Updated broken image handling:
>All broken images now display the ''IMAGE NOT FOUND'' placeholder
>Applied to thread cards, post images, expanded views, and previews
>Prevents infinite loading loops with proper fallback
>Better visual feedback for missing files', NULL, NULL, '2025-06-20 03:09:48', 'ImagePlaceholderFix', NULL, 0, NULL, 124),
(102, 19, 'Added placeholder image to Thread #21:
>Copied IMAGE NOT FOUND placeholder to uploads directory
>Updated Thread #21 database to reference the placeholder image
>Thread now displays proper placeholder instead of broken image
>Maintains visual consistency across the board', NULL, NULL, '2025-06-20 03:10:47', 'Thread21Fix', NULL, 0, NULL, 125);

-- Insert data into users
INSERT INTO users (id, username, password, is_admin, created_at) VALUES
(1, 'admin', '$2b$10$UCF7LlgYs0FNAm9.TPI02.YkGCcd/OvcN1yl2qSCqpMZ/e.0dPiZi', 1, '2025-06-19 05:05:46'),
(3, 'moderator', '$2b$10$VMbRn18mYWg6LIjuzohDtuy7xoXuzt1akfp8v1r2SGVDae7O3.4xW', 1, '2025-06-19 05:09:57'),
(6, 'newadmin', '$2b$10$xbr7raQfX0hG6sX8UzpRIu24Xx.9nFOSUulZs.cUQNozUeCy2zbKe', 1, '2025-06-19 05:22:43'),
(7, 'w0rtz', '$2b$10$f.K4daRf.dlDV/8p8Ttof.G6VVz9IA05gsXnUdq/E4BkrXdB2FJFO', 1, '2025-06-19 05:22:43');

-- Insert data into chat_messages
INSERT INTO chat_messages (id, username, message, tripcode, created_at) VALUES
(1, 'Lurker6351', 'hello', NULL, '2025-06-20 02:28:06'),
(2, 'Newfag3693', 'hi', NULL, '2025-06-20 02:28:15'),
(3, 'Lurker4529', 'chopped austin', NULL, '2025-06-20 02:30:48'),
(4, 'Anonymous8265', 'hello', NULL, '2025-06-20 02:31:03'),
(5, 'Lurker4529', 'chopped austin', NULL, '2025-06-20 02:31:13'),
(6, 'Lurker4529', 'goodbye chopped', NULL, '2025-06-20 02:31:44'),
(7, 'Poster2024', 'skiptard', NULL, '2025-06-20 02:34:31'),
(8, 'Oldfag1209', 'hello', NULL, '2025-06-20 02:36:03'),
(9, 'Visitor7176', 'posterboard2000', NULL, '2025-06-20 02:36:05'),
(10, 'Newfag5000', 'after', NULL, '2025-06-20 02:37:48'),
(11, 'Guest3213', 'hi', NULL, '2025-06-20 02:37:53'),
(12, 'Guest3213', 'hi', NULL, '2025-06-20 02:37:53'),
(13, 'Newfag5000', 'burger', NULL, '2025-06-20 02:38:42'),
(14, 'Newfag5609', 'hello', NULL, '2025-06-20 02:38:56'),
(15, 'Newfag5609', 'hru', NULL, '2025-06-20 02:39:03'),
(16, 'Newfag5000', 'yea', NULL, '2025-06-20 02:39:06'),
(17, 'Newfag5000', 'good', NULL, '2025-06-20 02:39:09'),
(18, 'Newfag5000', 'kinda', NULL, '2025-06-20 02:39:13'),
(19, 'Newfag5000', 'saw two burgers kissing didn’t know what that shit means', NULL, '2025-06-20 02:39:52'),
(20, 'Anon6247', 'hello', NULL, '2025-06-20 02:40:20'),
(21, 'Anon6247', 'auto scrol?', NULL, '2025-06-20 02:40:37'),
(22, 'Guest7120', 'hello', NULL, '2025-06-20 02:41:16'),
(23, 'Guest7120', 'hello', NULL, '2025-06-20 02:41:22'),
(24, 'Guest7120', 'hi', NULL, '2025-06-20 02:41:23'),
(25, 'Newfag8989', 'that’s when i went to burger king', NULL, '2025-06-20 02:41:27'),
(26, 'Newfag8989', 'i went to burger kiiiing', NULL, '2025-06-20 02:41:34'),
(27, 'Guest7120', 'why', NULL, '2025-06-20 02:41:51'),
(28, 'User9488', 'why', NULL, '2025-06-20 02:42:05'),
(29, 'Visitor3129', 'hello', NULL, '2025-06-20 02:42:20'),
(30, 'Visitor3129', 'hi', NULL, '2025-06-20 02:42:22'),
(31, 'Visitor3129', 'whatsup', NULL, '2025-06-20 02:42:24'),
(32, 'Visitor1901', 'tastes good', NULL, '2025-06-20 02:42:26'),
(33, 'Visitor1901', 'we should go 2 5guys', NULL, '2025-06-20 02:42:39'),
(34, 'Visitor1901', 'wait i think u fixed it', NULL, '2025-06-20 02:42:47'),
(35, 'Visitor3129', 'trueeeee', NULL, '2025-06-20 02:42:47'),
(36, 'Anonymous8635', 'i fixed it except for fact that when u open chatroom it starts u at top', NULL, '2025-06-20 02:43:16'),
(37, 'Anonymous8635', 'ok', NULL, '2025-06-20 02:43:17'),
(38, 'Anonymous8635', 'now it is truly fixed', NULL, '2025-06-20 02:43:21'),
(39, 'Anonymous8635', 'wait i think i see an issue', NULL, '2025-06-20 02:43:26'),
(40, 'Anonymous8635', 'ggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg', NULL, '2025-06-20 02:43:29'),
(41, 'Anonymous8635', 'ggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg', NULL, '2025-06-20 02:43:34'),
(42, 'Anonymous8635', 'oh shit lol', NULL, '2025-06-20 02:43:37'),
(43, 'Anonymous8635', 'lol', NULL, '2025-06-20 02:45:34'),
(44, 'Peasant9212', 'tripcode', '1V7EL', '2025-06-20 02:45:51'),
(45, 'Peasant9212', 'ok now it has line wrapping and set width', NULL, '2025-06-20 02:46:01'),
(46, 'Peasant2202', 'ggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg', NULL, '2025-06-20 02:48:02'),
(47, 'Peasant2202', 'gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg', NULL, '2025-06-20 02:48:03'),
(48, 'Peasant2202', 'gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg', NULL, '2025-06-20 02:48:07'),
(49, 'Peasant2202', 'gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg', NULL, '2025-06-20 02:48:15'),
(50, 'Peasant2202', 'gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg', NULL, '2025-06-20 02:48:19'),
(51, 'Peasant2202', 'hello', NULL, '2025-06-20 02:48:22'),
(52, 'Peasant2202', 'hi', NULL, '2025-06-20 02:48:24'),
(53, 'Peasant2202', 'character limit is set', NULL, '2025-06-20 02:48:36'),
(54, 'Peasant2202', 'redeploying website', NULL, '2025-06-20 02:48:38'),
(55, 'Peasant2202', 'redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying redeploying', NULL, '2025-06-20 02:49:06'),
(56, 'Poster5787', 'testing testing testing', NULL, '2025-06-20 02:50:14'),
(57, 'Peasant1557', '“Call out now; Is there anyone who will answer you? And to which of the holy ones will you turn? For wrath kills a foolish man, And envy slays a simple one. I have seen the foolish taking root, But suddenly I cursed his dwelling place. His sons are far from safety, They are crushed in the gate, And there is no deliverer. Because the hungry eat up his harvest, Taking it even from the thorns, And a snare snatches their substance. For affliction does not come from the dust, Nor does trouble spring from the ground; Yet man is born to trouble, As the sparks fly upward. “But as for me, I would seek God, And to God I would commit my cause— Who does great things, and unsearchable, Marvelous things without number. He gives rain on the earth, And sends waters on the fields. He sets on high those who are lowly, And those who mourn are lifted to safety.', NULL, '2025-06-20 02:51:17'),
(58, 'Poster5559', 'pls work', '1V7EL', '2025-06-20 02:54:32'),
(59, 'Peasant7966', '“Call out now; Is there anyone who will answer you? And to which of the holy ones will you turn? For wrath kills a foolish man, And envy slays a simple one. I have seen the foolish taking root, But suddenly I cursed his dwelling place. His sons are far from safety, They are crushed in the gate, And there is no deliverer. Because the hungry eat up his harvest, Taking it even from the thorns, And a snare snatches their substance. For affliction does not come from the dust, Nor does trouble spring from the ground; Yet man is born to trouble, As the sparks fly upward. “But as for me, I would seek God, And to God I would commit my cause— Who does great things, and unsearchable, Marvelous things without number. He gives rain on the earth, And sends waters on the fields. He sets on high those who are lowly, And those who mourn are lifted to safety.', NULL, '2025-06-20 02:54:39'),
(60, 'Anonymous1302', 'wasnt me', NULL, '2025-06-20 02:57:52'),
(61, 'Anonymous1302', 'kebob', NULL, '2025-06-20 02:58:54'),
(62, 'Anonymous1302', 'wish i had more kebob instead of getting angry and frustrated', NULL, '2025-06-20 02:59:16'),
(63, 'Anonymous1302', 'now i’m hungry', NULL, '2025-06-20 02:59:23'),
(64, 'Anonymous1302', 'halal', NULL, '2025-06-20 03:01:07'),
(65, 'Anonymous1302', 'now i’m happy', NULL, '2025-06-20 03:01:34'),
(66, 'Peasant5349', 'testing testing testing', NULL, '2025-06-20 03:25:32'),
(67, 'Peasant5349', 'hru', '1V7EL', '2025-06-20 03:25:38'),
(68, 'User6150', 'hi pete', NULL, '2025-06-20 03:25:54'),
(69, 'User6150', 'peru', NULL, '2025-06-20 03:26:03'),
(70, 'Lurker8588', 'hello', NULL, '2025-06-20 04:16:30'),
(71, 'Visitor3865', 'allahu akbar type shi', NULL, '2025-06-21 03:55:50');

-- Insert data into thread_pins
INSERT INTO thread_pins (id, thread_id, pinned_by, created_at) VALUES
(1, 13, 1, '2025-06-19 06:17:44');

SET FOREIGN_KEY_CHECKS = 1;
