<?php

$a1 = [
    0 => 'a',
    1 => 'b',
    2 => 'c',
    'key1' => 'value1',
    'key2' => 'value2',
];
$a2 = [
    0 => 'e',
    1 => 'f',
    2 => 'g',
    3 => 'h',
    'key1' => 'value3',
    'key2' => 'value4',
    'key3' =>'value5'
];
print_r(array_merge($a1, $a2));
print_r($a1 + $a2);
