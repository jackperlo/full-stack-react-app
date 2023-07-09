-- SQLite
-- SQLite
BEGIN TRANSACTION;

DROP TABLE contents;
DROP TABLE pages;
DROP TABLE images;
DROP TABLE users;
DROP TABLE cms_name;

CREATE TABLE IF NOT EXISTS "cms_name" (
	"name" TEXT PRIMARY KEY
);
CREATE TABLE IF NOT EXISTS "images" (
	"id" INTEGER PRIMARY KEY,
	"name" TEXT
);
CREATE TABLE IF NOT EXISTS "users" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"email"	TEXT,
	"name"	TEXT,
  "surname" TEXT,
	"salt"	TEXT,
	"password"	TEXT,
  "role" TEXT
);
CREATE TABLE IF NOT EXISTS "pages" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"title"	TEXT,
	"author_id"	INTEGER,
	"creation_date"	DATE,
  "publication_date" DATE,
	FOREIGN KEY(author_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS "contents" (
	"id"	INTEGER PRIMARY KEY AUTOINCREMENT,
	"header_type" INTEGER,
  "header_content" TEXT,
	"image_type" INTEGER,
  "image_content" INTEGER,
	"paragraph_type" INTEGER,
  "paragraph_content" TEXT,
	"position"	INTEGER,
	"page_id"	INTEGER,
	"author_id" INTEGER,
	FOREIGN KEY(image_content) REFERENCES images(id),
	FOREIGN KEY(page_id) REFERENCES pages(id),
	FOREIGN KEY(author_id) REFERENCES users(id)
);

/*password=pwd*/
/*Author ID=4 -> 0 pages created | Author ID=3 -> 2 pages created | Author ID=2 -> 4 pages created*/
INSERT INTO "users" VALUES (1, 'admin@mail.com', 'Mario', 'Rossi', '123348dusd437840', 'bddfdc9b092918a7f65297b4ba534dfe306ed4d5d72708349ddadb99b1c526fb', 'Admin');
INSERT INTO "users" VALUES (2, 'author1@mail.com', 'Luigi', 'Verdi', '7732qweydg3sd637', '498a8d846eb4efebffc56fc0de16d18905714cf12edf548b8ed7a4afca0f7c1c', 'Author');
INSERT INTO "users" VALUES (3, 'author2@mail.com', 'Alice', 'Bianchi', 'wgb32sge2sh7hse7', '09a79c91c41073e7372774fcb114b492b2b42f5e948c61d775ad4f628df0e160', 'Author');
INSERT INTO "users" VALUES (4, 'author3@mail.com', 'Giorgia', 'Gialli', 'safd6523tdwt82et', '330f9bd2d0472e3ca8f11d147d01ea210954425a17573d0f6b8240ed503959f8', 'Author');

INSERT INTO "images" VALUES(0, 'http://localhost:3001/public/images/image1.jpg');
INSERT INTO "images" VALUES(1, 'http://localhost:3001/public/images/image2.jpg');
INSERT INTO "images" VALUES(2, 'http://localhost:3001/public/images/image3.jpg');
INSERT INTO "images" VALUES(3, 'http://localhost:3001/public/images/image4.jpg');

/*2 pages for type*/
INSERT INTO "pages" VALUES (1,'Just the best CMS',2,'2023-02-28','2023-03-22'); /*published*/
INSERT INTO "pages" VALUES (2,'Is Javascript better than Python?',2,'2023-05-20','2023-08-28');/*programmed*/
INSERT INTO "pages" VALUES (3,'Nobody queues for a flat rollercoaster',3,'2023-04-28', NULL); /*draft*/
INSERT INTO "pages" VALUES (4,'What about Chat GPT?',2,'2023-01-15','2023-01-28'); /*published*/
INSERT INTO "pages" VALUES (5,'Just saying... what surprise is React',3,'2023-03-10','2023-10-18');/*programmed*/
INSERT INTO "pages" VALUES (6,'Never make a permament decision under temoporary emotion',2,'2023-01-13', NULL); /*draft*/

/*page 1*/
INSERT INTO "contents" VALUES (1,1,'This is the first header ever',0,'',0,'',0,1,2);
INSERT INTO "contents" VALUES (2,0,'',0,'',1,'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',1,1,2);
INSERT INTO "contents" VALUES (3,0,'',1,0,0,'',2,1,2);

/*page 2*/
INSERT INTO "contents" VALUES (4,1,'This page is programmed to be published on mum birthday',0,'',0,'',0,2,2);
INSERT INTO "contents" VALUES (5,0,'',0,'',1,'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis.',1,2,2);

/*page 3*/
INSERT INTO "contents" VALUES (6,1,'This page is just a draft, nobody cares',0,'',0,'',0,3,3);
INSERT INTO "contents" VALUES (7,0,'',1,1,0,'',1,3,3);

/*page 4*/
INSERT INTO "contents" VALUES (8,1,'Cmon read me.. interesting stuffs explained',0,'',0,'',0,4,2);
INSERT INTO "contents" VALUES (9,0,'',1,2,0,'',1,4,2);
INSERT INTO "contents" VALUES (10,0,'',0,'',1,'But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness.',2,4,2);

/*page 5*/
INSERT INTO "contents" VALUES (11,1,'Probably written while drunk.. an header after an image (lol)',0,'',0,'',1,5,3);
INSERT INTO "contents" VALUES (12,0,'',1,2,0,'',0,5,3);

/*page 6*/
INSERT INTO "contents" VALUES (13,1,'Last but not least',0,'',0,'',0,6,2);
INSERT INTO "contents" VALUES (14,0,'',0,'',1,'On the other hand, we denounce with righteous indignation and dislike men who are so beguiled and demoralized by the charms of pleasure of the moment, so blinded by desire, that they cannot foresee the pain and trouble that are bound to ensue.',1,6,2);
INSERT INTO "contents" VALUES (15,0,'',0,'',1,'But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness.',2,6,2);
INSERT INTO "contents" VALUES (16,0,'',1,3,0,'',3,6,2);

INSERT INTO "cms_name" VALUES ('CMSmall');
COMMIT;
