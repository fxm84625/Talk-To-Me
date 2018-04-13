numRecent = 2
wordsArray = [ 'hi', 'two', 'three', 'four', ':::', '5', '6', '7', ':::', '8', ':::', '9', '10', ':::', '11', '12', ':::' ]

recentWordsArray = []
recentCount = 0
for i in reversed( wordsArray ):
    if( i == ':::' ):
        recentCount += 1
    elif( recentCount <= numRecent ):
        recentWordsArray.append( i )
    else:
        break

recentWordsArray.reverse()
print( recentWordsArray )
