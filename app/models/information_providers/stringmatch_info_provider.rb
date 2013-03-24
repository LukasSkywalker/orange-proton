#encoding: utf-8
# yes, unlike many texteditors, ruby cannot figure this out without a bom
class StringmatchInfoProvider < DatabaseInfoProvider

  $stringmatchLanguage = "de"
  def get_fields(icd_code, max_count, language)
    allfs = db.get_fs_names($stringmatchLanguage)


    icd =   db.get_icd(icd_code,$stringmatchLanguage)
    names = []
    names << icd["text"]
    names.concat(icd["synonyms"])

    puts "before prepare"
    puts names
    names.each {|n| cmatch_prepare(n)}
    puts "after prepare"
puts names 

    fs = []
    allfs.each {|fs_code, fs_name|
      fs_name = cmatch_prepare(fs_name)
      relatedness = 0
      names.each { |n|

        relatedness += sequence_matching(n, fs_name)
      }
      fs << format_fs_code_for_api(fs_code, relatedness, language)
    }

    normalize_relatedness(fs)

    return {
      data:   db.get_icd(icd_code,language),
      fields: fs,
      type:   get_code_type(icd_code)
    }
  end


  $map ={'ologie' => '', 'opathie' => '', 'iatrie' => '', 'medizin' => '', 'enter' => '', 'exter' => '', 'ische' => '', 'ierte' => '', 'ative' => '', 'tion' => ' ', ' und '=> ' ', ' durch ' => ' ', 'krankheit' => '', 'endo' => '', 'chungen' => '', 'klassisch' => '', 'mato' => '', 'gesichert' => '', 'ologisch' => '', ' der '=> ' ', ' des '=>' ', ' am ' => ' ', ' an '=>' ', 'akut' => '', 'schwer' => '', 'sonstige' =>  '', 'opth' => '', 'nicht' => '', 'näher' => '', 'ohne' => '', 'angabe' =>'', ' mit '=> '', ' für '=>'', 'blindh' => 'blindhh', 'haut' => 'hautt', 'heit' => '', 'hiv' => 'hi-virus', 'behandlung' => '', 'lunge' => 'l{unge}', 'ungen' => '', 'erkrankung' => '', 'übertragbar' => '' }

  def cmatch_prepare(s)
    s.downcase!
    $map.each{|a,b| s.gsub!(a, b)}
    s
  end
  # returns the number of 5 matched consecutive character sequences
  def character_matching(first, second)
    i=0; j=4; p=0
    for j in 4..first.length()-1
      k=0; l=4
      for l in 4..second.length()-1
        x = first[i..j]
        y = second[k..l]
        if (x.eql? y) && (!x.include?(' '))
          p = p+1
        end
        k = k+1
        l = l+1
      end
      i = i+1
      j = j+1
    end

    if p > 0
      puts first
      puts second
    end
    return p
  end

  # returns the number of the longest matched character sequence
  def sequence_matching(first, second)
    x=0
    for j in 0..first.length()-1
      for kk in 0..second.length()-1
        i=j; 
        k = kk
        p=0;
        b = false
        while first[i]==second[k] do
          if first[i] == ' ' then break end
          p = p+1
          i=i+1
          k=k+1
          #puts first[i]
          if k==second.length() || i == first.length() 
            then break end
        end
        #puts ""
        if x<p then x=p end
      end
    end

    return x
  end

end
