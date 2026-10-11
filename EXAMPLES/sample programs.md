# **sample programs**

&#x20;

**# loop sum 0 to 10**

&#x20;   bofahh letsete0, 0

&#x20;   bofahh sephetho0, 0

&#x20;   bofahh sephetho1, 10

&#x20;   bofahh nakoana1, 1



loop:

&#x20;   kopanya letsete0, letsete0, sephetho0 # sum += i

&#x20;   eketsa sephetho0, sephetho0, 1 # i++

&#x20;   tlosa nakoana2, sephetho1, sephetho0 # temp check

&#x20;   le nakoana3, letsete0, sephetho0 # R-type

&#x20;   kapa nakoana4, letsete0, nakoana1 # R-type

&#x20;   boloka letsete0, 8(mokou) # S-type



&#x20;   ekholo sephetho1, sephetho0, loop # B-type: if N >= i, continue

&#x20;   lekana sephetho0, nakoana1, end # B-type



end:

&#x20;   chechisa sephetho0, letsete0

&#x20;   suthumetsa sephetho0, sephetho0, 0

&#x20;   qhoma lehe, 0(letsibolo)





**# (a + b)^2 where a=5, b=3 -> (8)^2 = 64**



&#x20;   bofahh sephetho0, 5 # a = 5

&#x20;   bofahh sephetho1, 3 # b = 3



&#x20;   kopanya sephetho2, sephetho0, sephetho1 # c = a+b = 8



&#x20;   bofahh letsete0, 0 # letsete0  = 0

&#x20;   bofahh letsete1, 0 # letsete1 = i = 0

&#x20;   chechisa nakoana1, sephetho2 # nakoana1 = c = 8



loop\_m:

&#x20;   kopanya letsete0, letsete0, sephetho2 # result += c

&#x20;   eketsa letsete1, letsete1, 1 # i++



&#x20;   lekana letsete1, nakoana1, done # if i == c, done

&#x20;   ekholo nakoana1, letsete1, loop\_m # if c >= i, loop



done:

&#x20;   eketsa mokou, mokou, -16

&#x20;   boloka letsete0, 0(mokou) # Mem\[sp] = 64

&#x20;   chechisa sephetho0, letsete0 # return value = 64

&#x20;   qhoma lehe, 0(letsibolo) # ret

&#x20;

\# **COMPARE a=50 vs b=80**

**# return 0=equal, 1=a bigger, 2=b bigger**



bofahh sephetho0, 50

bofahh sephetho1, 80



lekana sephetho0, sephetho1, EQUAL

ekholo sephetho0, sephetho1, GREATER



LESS:

&#x20; bofahh sephetho0, 2

&#x20; qhoma lehe, 0(letsibolo)



GREATER:

&#x20; bofahh sephetho0, 1

&#x20; qhoma lehe, 0(letsibolo)



EQUAL:

&#x20; bofahh sephetho0, 0

&#x20; qhoma lehe, 0(letsibolo)

