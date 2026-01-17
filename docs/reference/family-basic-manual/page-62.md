# BASIC

## DIM

**Working**

Declares an array.

**Grammar**

```
DIM name of array (m1 (, m2)) (, name of array (n1 (, n2)) ...)
```

- Name of array -> name of array, numerical variable, character variable O.K.

**Abbreviation**

DI.

**Explanation**

Sets the name of the array and the amount of dimensions, as well as the size of additional characters. You can declare multiple arrays within one `DIM` sentence, and you can specify additional characters of up to two dimensions within the scope of the memory for each array. After declaring the array, all of the content of the array become cleared, numerical type arrays become 0.

**Sample Program**

#### (1) Example of a numerical type array

```basic
10 REM * DIM --- (1) *
20 DIM A(3),B(3,3) ' array declaration
30 FOR I=0 TO 3
40 A(I)=I
50 PRINT A(I); ' Substitute and display the numerical values within a one dimensional array A(I).
60 NEXT
70 PRINT: PRINT
80 FOR I=0 TO 3
90 FOR J=0 TO 3
100 B(I,J)=I*10+J
110 PRINT B(I,J); ' Substitute and display the numerical values within a two dimensional array B(I,J).
120 NEXT
130 NEXT
```

#### (2) Declaration of a character type array

```basic
10 REM * DIM --- (2) *
20 DIM A$(3),B$(3,3) ' Array declaration
30 FOR I=0 TO 3
40 A$(I)="TEST"+STR$(I)
50 PRINT A$(I) ' Substitute and display the numerical values within one dimensional array A$(I).
60 NEXT
70 PRINT
80 FOR I=0 TO 3
90 FOR J=0 TO 3
100 B$(I,J)="TOKYO"+STR$(I)+STR$(J)
110 PRINT B$(I,J) ' Substitute and display the numerical values within a two dimensional array B$(I,J).
120 NEXT
130 NEXT
```

---

*Page 62*

