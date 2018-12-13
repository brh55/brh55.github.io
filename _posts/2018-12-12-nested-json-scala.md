---
layout: post
title: Handling Recrusive Nested JSON structures in Scala
comments: true
author: brandon
image: assets/images/scala-json.jpg
categories: [scala, development]
---
# Recursive JSON in Play Framework 2.6.X
When handling nested JSON structures, it's not entirely straightforward since the example don't offer too much context in regards to handling this.
We already know that a `Reads` converter needs a corresponding model.

```json
{
   "name": "Brandon",
   "age": 75,
   "sex": "male"
}
```

```scala
case class Human(name: Stringge: Int, sex: String)

// Builder
val humanReads: Reads[Human] = (
    (__ \ "name").read[String] and
    (__ \ "age").read[Int] and
    (__ \ "sex").read[String]
)(Human.apply _)
```

But what if have a JSON structure contains a sequence or list of other `Objects` like children? Simple...

```json
{
   "name": "Brandon",
   "age": 75,
   "sex": "male",
   "children": [
      {
         "name": "Emily",
         "age": 45,
         "sex": "female",
       },
       {
        "name": "Sam",
        "age": 42,
        "sex": "male",
       }
   ]
}
```

```scala
case class Human(name: String, "age": Int, sex: String, children: Option[List[Human]])

// Builder
implicit val humanReads: Reads[Human] = (
    (__ \ "age").read[Int] and
    (__ \ "sex").read[String] and
    (__ \ "chilidren).readNullable[List[Human]]
)(Human.apply _)
```

Just wrap it as an "optional" list with a `Human` type. However, this only represents __one__ level deep.
What if you wanted to create a family tree based on a loaded JSON structure? Fear not, this is where `lazyRead` and `lazyWrites` comes into play!

> In computer programming, lazy initialization is the tactic of delaying the creation of an object, the calculation of a value, or some other expensive process until the first time it is needed. It is a kind of lazy evaluation that refers specifically to the instantiation of objects or other resources.

These *lazy* methods to handle these recursions without affecting performance of modeling a structure until it's finally needed.
To use this, we apply a `lazyRead` or `lazyWrite` to our `Builder` or `Reader` to inform the builder apply the reader upon this property.


```json
{
   "name": "Brandon",
   "age": 85,
   "sex": "male",
   "children": [
      {
         "name": "Emily",
         "age": 45,
         "sex": "female",
       },
       {
        "name": "Sam",
        "age": 52,
        "sex": "male",
        "children": [
           {
              "name": "Sona",
              "age": 30,
              "sex": "female",
              "children": [
                 {
                    "name": "Tom",
                    "age": 1,
                    "sex": "male"
                 }
              ]
            }
        ]
       }
   ]
}
```

```scala
case class Human("age": Int, sex: String, "children": Option[List[Human]])

// Builder
implicit val humanReads: Reads[Human] = (
    (__ \ "age").read[Int] and
    (__ \ "sex").read[String] and
    (__ \ "chilidren).lazyReadullable[Reads.list[Human]](humanReads)
)(Human.apply _)
```

**Viola!**
