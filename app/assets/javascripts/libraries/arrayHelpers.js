/******************************************************************************
 Useful helper functions for different array manipulations
 Copyright (C) 2010 The Otrax Project / Lukas Diener

 This program is free software; you can redistribute it and/or
 modify it under the terms of the GNU General Public License
 as published by the Free Software Foundation; either version 2
 of the License, or (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program; if not, write to the Free Software
 Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *******************************************************************************/

/* sort an array faster than the native Array.sort method */
Array.prototype.insertSort = function() {
  for (var i = 1; i < this.length; i++) {
    var tmp = this[i],
        j = i;
    while (this[j - 1] > tmp) {
      this[j] = this[j - 1];
      --j;
    }
    this[j] = tmp;
  }
}

/* sort an array of objects by a specific property */
Array.prototype.sortBy = function( property ) {
  for (var i = 1; i < this.length; i++) {
    var tmp = this[i],
        j = i;
    while (j > 0 && this[j - 1][property] > tmp[property]) {
      this[j] = this[j - 1];
      --j;
    }
    this[j] = tmp;
  }
}

/* create an array out of the given properties of the source array */
Array.prototype.pluck = function( property ) {
  var arr = [];
  for (var i = 0; i < this.length; i++) {
    arr.push(this[i][property]);
    console.log(this[i]);
  }
  return arr;
};

/* get the max value of an array */
Array.prototype.max = function () {
  return Math.max.apply(Math, this);
};

/* get the min value of an array */
Array.prototype.min = function () {
  return Math.min.apply(Math, this);
};

/* sum up all elements in the array */
Array.prototype.sum = function() {
  for (var i = 0, sum = 0; i < this.length; sum += this[i++]);
  return sum;
}

/* cut array into chunks of specified size */
Array.prototype.chunk = function(s) {
  for(var x, i = 0, c = -1, l = this.length, n = []; i < l; i++)
    (x = i % s) ? n[c][x] = this[i] : n[++c] = [this[i]];
  return n;
}

/* check of an array contains a specific element */
Array.prototype.contains = function(element) {
  var i = this.length;
  while (i--) {
    if (this[i] === element) {
      return true;
    }
  }
  return false;
};

/* clear array */
Array.prototype.clear = function() {
  this.length = 0;
};

/* remove the elements starting at 'from' til position 'to' */
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

Array.prototype.removeElement = function(el) {
  for(var i = 0; i < this.length; i++) {
    if(this[i] == el)
      this.splice(i, 1);
  }
};

/* rotate array by the given steps */
Array.prototype.rotate = function(p) {
  for(var l = this.length, p = (Math.abs(p) >= l && (p %= l), p < 0 && (p += l), p), i, x; p; p = (Math.ceil(l / p) - 1) * p - l + (l = p))
    for(i = l; i > p; x = this[--i], this[i] = this[i - p], this[i - p] = x);
};

/* random permutation */
Array.prototype.shuffle = function() {
  for (var i = this.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = this[i];
    this[i] = this[j];
    this[j] = temp;
  }
};

Array.prototype.isEmpty = function (){
    return this.length === 0;
};

Array.prototype.lastIndexOf = function(element) {
    for (var i = this.length - 1; i >= 0; i--) {
        if (element === this[i])
            return i;
    }

    return null;
};

/* return last element of array*/
if(!Array.prototype.last) {
    Array.prototype.last = function() {
        return this[this.length - 1];
    }
}
