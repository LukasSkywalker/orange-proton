# returns the number of 5 matched consecutive character sequences
def character_matching(first, second)

  map ={'ologie' => '', 'ographie' => '', 'opathie' => '', 'skopie' => '',
        'iatrie' => '', 'chirurgie' => '', 'therapie' => '', 'medizin' => '' }

  map.each{|a,b| first.gsub!(a, b)}
  map.each{|a,b| second.gsub!(a, b)}

  i=0; j=4; p=0
  for j in 4..first.length()-1
    k=0; l=4
    for l in 4..second.length()-1
      x = first[i..j].downcase
      y = second[k..l].downcase
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