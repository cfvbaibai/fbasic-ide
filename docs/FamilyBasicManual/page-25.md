# BASIC

## Let's display a Mario of several poses

**Let's try to display a Mario of several poses on-screen. Use the program on p. 23 and enter the following program.**

**Program Listing:**

```basic
15 CGSET 1,0
21 DEF SPRITE 1,(0,1,0,0,0)=CHR$(0)+CHR$(1)+CHR$(2)+CHR$(3)
22 DEF SPRITE 2,(0,1,0,1,0)=CHR$(5)+CHR$(4)+CHR$(7)+CHR$(6)
23 DEF SPRITE 3,(0,1,0,0,0)=CHR$(4)+CHR$(5)+CHR$(6)+CHR$(7)
24 DEF SPRITE 4,(0,1,0,0,0)=CHR$(20)+CHR$(21)+CHR$(22)+CHR$(23)
25 DEF SPRITE 5,(0,1,0,1,0)=CHR$(21)+CHR$(20)+CHR$(23)+CHR$(22)
30 SPRITE 0,100,100
40 SPRITE 1,150,100
50 SPRITE 2,100,150
60 SPRITE 3,150,150
70 SPRITE 4,100,50
80 SPRITE 5,150,50
```

**Execution:**

Enter: `RUN [RETURN]`

A Mario with 6 types of poses will be displayed on-screen.

*Please refer to "Character Table A" on the back cover to know more about the different poses of Mario.*

**General BASIC Learning:**

If you have read up to here, you probably already have an idea of what a BASIC program is and how to make it work. In other words, you have learnt the basic matters of BASIC. You already are a BASIC programmer. You certainly are able to create simple programs. Please give it a try!

Hereafter, from p. 26 to p. 30, we will develop the basics of BASIC and explain about a program in which you can move an animated character freely using a controller.

## About the method to display an animated character

### DEF MOVE

Until now we have explained about the DEF SPRITE (define sprite) command, but we're going to introduce an extra one. It is called the DEF MOVE (define move) command.

- This is a smart command which moves easily the 16 types of animated characters on Character Table A.
- If you assign the 16 types with the DEF MOVE command, the animated characters will be assembled automatically and you can display their movement.
- You can assign the direction, speed, movement distance, color and display priority.
- The usage of this command is explained in the "About the MOVE command" chapter. *Please refer to p. 32 for more details.

With the DEF SPRITE command explained in the beginning, you can compose the animated characters freely, in addition, when you use the simple DEF MOVE command, simultaneously, you will also be able to display a total of 16 different characters.

---

*Page 25*

