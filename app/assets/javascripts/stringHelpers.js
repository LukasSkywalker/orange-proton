/******************************************************************************
 Useful helper functions for different string manipulations
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

/* trim leading and trailing whitespace from a string */
String.prototype.trim = function() {
  this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}

/* capitalize a string */
String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.substring(1).toLowerCase();
};

/* add ellipses after the specified leng... */
String.prototype.ellipses = function(len) {
  return (this.length > len) ? this.substr(0, len) + "..." : this;
}

/* "format {0} string {1}".format("any", "you want") */
String.prototype.format = function() {
  var args = arguments;
  return this.replace(/{(\d+)}/g, function(match, number) {
    return typeof args[number] != 'undefined'
        ? args[number]
        : match
        ;
  });
};