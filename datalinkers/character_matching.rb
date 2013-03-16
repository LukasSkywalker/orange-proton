# returns the number of 5 matched consecutive character sequences
def character_matching(first, second)

  map ={'ologie' => '', 'ographie' => '', 'opathie' => '', 'skopie' => '',
        'iatrie' => '', 'chirurgie' => '', 'therapie' => '', 'medizin' => '' }

  first = first.downcase
  second = second.downcase

  map.each{|a,b| first.gsub!(a, b)}
  map.each{|a,b| second.gsub!(a, b)}

  i=0; j=4; p=0
  for j in 4..first.length()-1
    k=0; l=4
    for l in 4..second.length()-1
      x = first[i..j]
      y = second[k..l]
      if x.eql? y
        p = p+1
      end
      k = k+1
      l = l+1
    end
    i = i+1
    j = j+1
  end

  return p
end

# returns the number of the longest matched character sequence
def sequence_matching(first, second)

  map ={'ologie' => '', 'ographie' => '', 'opathie' => '', 'skopie' => '',
        'iatrie' => '', 'chirurgie' => '', 'therapie' => '', 'medizin' => '' }

  first = first.downcase
  second = second.downcase

  map.each{|a,b| first.gsub!(a, b)}
  map.each{|a,b| second.gsub!(a, b)}

  j=0; p=0; x=0
  for j in 0..first.length()-1
    i=j; k=0
    while first[i]==second[k] do
      p = p+1
      i=i+1
      if k<second.length()-1 then k=k+1 end
    end
    if x<p then x=p end
    p=0;
  end

  return x
end